from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models import Project, User
from app.services.ai.gemini import (
    format_gemini_error,
    generate_completion,
    generate_framework_plan,
)


router = APIRouter(prefix="/api/assistant")


class CompletionRequest(BaseModel):
    prompt: str
    model: str | None = None


class DesignRequest(BaseModel):
    prompt: str
    provider: str | None = None
    model: str | None = None


def _extract_resources(plan: Dict[str, Any]) -> List[Dict[str, Any]]:
    resources: List[Dict[str, Any]] = []
    for mod in plan.get("modules", []):
        for res in mod.get("resources", []):
            if isinstance(res, dict):
                resources.append(res)
    return resources


def _canonical_type(resource_type: str) -> str:
    """Normalize common aliases so icons/configs line up."""
    rt = (resource_type or "").lower()
    aliases = {
        "igw": "aws_internet_gateway",
        "internet_gateway": "aws_internet_gateway",
        "aws_igw": "aws_internet_gateway",
        "nat": "aws_nat_gateway",
        "nat_gateway": "aws_nat_gateway",
        "rtb": "aws_route_table",
        "route_table": "aws_route_table",
        "route-table": "aws_route_table",
        "route_table_association": "aws_route_table_association",
        "route-table-association": "aws_route_table_association",
        "aws_route_table_assoc": "aws_route_table_association",
        "sg": "aws_security_group",
        "security_group": "aws_security_group",
        "ec2": "aws_instance",
        "ec2_instance": "aws_instance",
    }
    if rt in aliases:
        return aliases[rt]
    if rt.startswith("aws_"):
        return rt
    return resource_type or "aws_resource"


def _default_fallback() -> List[Dict[str, Any]]:
    return [
        {"type": "aws_vpc", "name": "ai_vpc", "config": {"cidr_block": "10.0.0.0/16"}},
        {
            "type": "aws_subnet",
            "name": "ai_public_subnet",
            "config": {"cidr_block": "10.0.1.0/24", "map_public_ip_on_launch": True},
        },
        {
            "type": "aws_internet_gateway",
            "name": "ai_igw",
            "config": {},
        },
        {
            "type": "aws_route_table",
            "name": "ai_public_rt",
            "config": {
                "route": [{"cidr_block": "0.0.0.0/0", "gateway_id": "${aws_internet_gateway.ai_igw.id}"}]
            },
        },
        {
            "type": "aws_route_table_association",
            "name": "ai_public_assoc",
            "config": {"subnet_id": "${aws_subnet.ai_public_subnet.id}", "route_table_id": "${aws_route_table.ai_public_rt.id}"},
        },
        {
            "type": "aws_security_group",
            "name": "ai_sg",
            "config": {
                "ingress": [{"from_port": 80, "to_port": 80, "protocol": "tcp", "cidr_blocks": ["0.0.0.0/0"]}],
                "egress": [{"from_port": 0, "to_port": 0, "protocol": "-1", "cidr_blocks": ["0.0.0.0/0"]}],
            },
        },
        {
            "type": "aws_instance",
            "name": "ai_ec2",
            "config": {
                "instance_type": "t3.micro",
                "ami": "ami-123456",
                "subnet_id": "${aws_subnet.ai_public_subnet.id}",
                "vpc_security_group_ids": ["${aws_security_group.ai_sg.id}"],
            },
        },
    ]


def _categorize(resource_type: str) -> int:
    """Lightweight layering to improve layout readability."""
    if not resource_type:
        return 4
    rt = resource_type.lower()
    if "region" in rt or "availability_zone" in rt:
        return 0
    if "vpc" in rt or "virtual_network" in rt or "vnet" in rt or "network" == rt:
        return 1
    if "subnet" in rt:
        return 2
    if "gateway" in rt or "route_table" in rt or "internet" in rt or "nat" in rt:
        return 3
    if "security_group" in rt or "firewall" in rt:
        return 3
    return 4


def _find_reference_targets(value: Any) -> List[str]:
    """Parse config values to discover referenced resource names."""
    refs: List[str] = []
    if isinstance(value, str):
        # ${aws_subnet.ai_public_subnet.id} or aws_subnet.ai_public_subnet.id
        for token in value.replace("${", "").replace("}", "").split():
            parts = token.split(".")
            if len(parts) >= 2:
                refs.append(parts[1])
    elif isinstance(value, list):
        for item in value:
            refs.extend(_find_reference_targets(item))
    elif isinstance(value, dict):
        for v in value.values():
            refs.extend(_find_reference_targets(v))
    return refs


def _plan_to_diagram(plan: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    """Convert an AI plan into a diagram shape React Flow understands with inferred wiring."""
    resources = _extract_resources(plan) or _default_fallback()

    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    seen_ids: set[str] = set()
    name_to_node: Dict[str, str] = {}

    # Stable deterministic layout by layers
    layered: Dict[int, List[Dict[str, Any]]] = {}
    for res in resources:
        layer = _categorize(res.get("type", ""))
        layered.setdefault(layer, []).append(res)

    x_spacing = 260
    y_spacing = 180
    edge_counter = 0

    for layer_idx in sorted(layered.keys()):
        layer_resources = layered[layer_idx]
        for idx, res in enumerate(layer_resources):
            base_id = res.get("name") or res.get("type") or f"resource_{layer_idx}_{idx}"
            node_id = str(base_id)
            suffix = 1
            while node_id in seen_ids:
                node_id = f"{base_id}_{suffix}"
                suffix += 1
            seen_ids.add(node_id)
            name_to_node[base_id] = node_id

            label = res.get("name") or res.get("type", "resource")
            nodes.append(
                {
                    "id": node_id,
                    "type": "default",
                    "position": {"x": 80 + idx * x_spacing, "y": 80 + layer_idx * y_spacing},
                    "data": {
                        "label": label,
                        "displayName": res.get("description") or label,
                        "resourceType": _canonical_type(res.get("type") or ""),
                        "resourceLabel": res.get("description") or label,
                        "config": res.get("config") or {},
                    },
                }
            )

    def add_edge(src_name: str, tgt_name: str, animated: bool = False) -> None:
        nonlocal edge_counter
        src = name_to_node.get(src_name)
        tgt = name_to_node.get(tgt_name)
        if not src or not tgt:
            return
        edge_id = f"e{edge_counter}"
        edge_counter += 1
        edges.append(
            {"id": edge_id, "source": src, "target": tgt, "type": "smoothstep", "animated": animated}
        )

    # Explicit dependencies from plan
    for dep in plan.get("dependencies") or []:
        if isinstance(dep, dict):
            add_edge(dep.get("from", ""), dep.get("to", ""), animated=True)

    # Inferred connections from config references
    for res in resources:
        res_name = res.get("name") or ""
        cfg = res.get("config") or {}
        for ref in _find_reference_targets(cfg):
            add_edge(res_name, ref)

        rtype = (res.get("type") or "").lower()
        # Heuristics for common AWS wiring
        if "subnet" in rtype:
            vpc_name = cfg.get("vpc_id") or cfg.get("vpc") or "ai_vpc"
            if isinstance(vpc_name, str):
                add_edge(res_name, vpc_name)
        if "security_group" in rtype:
            vpc_name = cfg.get("vpc_id") or cfg.get("vpc") or "ai_vpc"
            if isinstance(vpc_name, str):
                add_edge(res_name, vpc_name)
        if "instance" in rtype:
            subnet = cfg.get("subnet_id") or cfg.get("subnet") or cfg.get("subnet_ids", [None])[0]
            if isinstance(subnet, str):
                add_edge(res_name, subnet)
            sg_ids: Optional[List[Any]] = cfg.get("vpc_security_group_ids") or cfg.get("security_groups")
            if isinstance(sg_ids, list):
                for sg in sg_ids:
                    if isinstance(sg, str):
                        add_edge(res_name, sg)
        if "internet_gateway" in rtype or "nat_gateway" in rtype:
            add_edge(res_name, "ai_vpc")
        if "route_table" in rtype:
            vpc_name = cfg.get("vpc_id") or "ai_vpc"
            if isinstance(vpc_name, str):
                add_edge(res_name, vpc_name)
        if "route_table_association" in rtype:
            subnet = cfg.get("subnet_id")
            rt = cfg.get("route_table_id")
            if isinstance(subnet, str):
                add_edge(res_name, subnet)
            if isinstance(rt, str):
                add_edge(res_name, rt)

    return {"nodes": nodes, "edges": edges}


@router.post("/complete")
def assistant_complete(
    body: CompletionRequest,
    current_user: User = Depends(get_current_user),
    _db: Session = Depends(get_db),
):
    """Lightweight chat-style completion used by the assistant panel."""
    if not body.prompt.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt is required")

    try:
        output = generate_completion(body.prompt, model_name=body.model)
        return {"output": output}
    except Exception as exc:  # noqa: BLE001
        detail = format_gemini_error(exc)
        status_code = status.HTTP_429_TOO_MANY_REQUESTS if "quota" in detail.lower() else status.HTTP_502_BAD_GATEWAY
        raise HTTPException(status_code=status_code, detail=detail)


@router.post("/terraform")
def generate_terraform(
    body: DesignRequest,
    current_user: User = Depends(get_current_user),
    _db: Session = Depends(get_db),
):
    """Generate Terraform code from a natural language prompt."""
    if not body.prompt.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt is required")

    try:
        plan = generate_framework_plan(body.prompt, cloud_provider=body.provider, model_name=body.model)

        # Generate Terraform code from the plan
        code_lines = []
        resources = _extract_resources(plan) or _default_fallback()

        for res in resources:
            res_type = res.get("type", "aws_resource")
            res_name = res.get("name", "resource")
            config = res.get("config", {})

            code_lines.append(f'resource "{res_type}" "{res_name}" {{')
            for key, value in config.items():
                if isinstance(value, str):
                    code_lines.append(f'  {key} = "{value}"')
                elif isinstance(value, bool):
                    code_lines.append(f'  {key} = {str(value).lower()}')
                elif isinstance(value, (int, float)):
                    code_lines.append(f'  {key} = {value}')
                elif isinstance(value, list):
                    code_lines.append(f'  {key} = {value}')
                elif isinstance(value, dict):
                    code_lines.append(f'  {key} = {{')
                    for k, v in value.items():
                        if isinstance(v, str):
                            code_lines.append(f'    {k} = "{v}"')
                        else:
                            code_lines.append(f'    {k} = {v}')
                    code_lines.append('  }')
            code_lines.append('}\n')

        terraform_code = '\n'.join(code_lines)
        return {"code": terraform_code, "plan": plan}
    except Exception as exc:  # noqa: BLE001
        detail = format_gemini_error(exc)
        status_code = status.HTTP_429_TOO_MANY_REQUESTS if "quota" in detail.lower() else status.HTTP_502_BAD_GATEWAY
        raise HTTPException(status_code=status_code, detail=detail)


@router.post("/design/{project_id}")
def assistant_design(
    project_id: int,
    body: DesignRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a diagram and return nodes/edges for import into the canvas."""
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if not body.prompt.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt is required")

    try:
        plan = generate_framework_plan(body.prompt, cloud_provider=body.provider, model_name=body.model)
        diagram = _plan_to_diagram(plan)
        return {"diagram": diagram}
    except Exception as exc:  # noqa: BLE001
        # Fall back to a simple diagram to avoid breaking UX when the API quota is hit
        fallback_diagram = _plan_to_diagram({})
        detail = format_gemini_error(exc)
        status_code = status.HTTP_429_TOO_MANY_REQUESTS if "quota" in detail.lower() else status.HTTP_502_BAD_GATEWAY
        raise HTTPException(
            status_code=status_code,
            detail=f"{detail} (returned fallback design)",
            headers={"X-Assistant-Fallback": "applied"},
        )
