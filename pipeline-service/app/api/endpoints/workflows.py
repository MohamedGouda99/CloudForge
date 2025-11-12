from __future__ import annotations

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dag_engine import DAGEngine
from app.core.database import get_db
from app.core.node_registry import node_registry
from app.models import (
    Workflow,
    WorkflowNode,
    WorkflowEdge,
    WorkflowRun,
    WorkflowRunStatus,
)
from app.schemas import (
    WorkflowCreate,
    WorkflowResponse,
    WorkflowUpdate,
    WorkflowRunRequest,
    WorkflowRunResponse,
)
from app.tasks.workflow import execute_workflow_task

router = APIRouter()


def _sync_nodes_and_edges(db: Session, workflow: Workflow, nodes_payload, edges_payload):
    """Persist the latest node and edge definitions for a workflow."""
    existing_nodes = {node.node_id: node for node in workflow.nodes}
    seen_keys = set()

    for node_data in nodes_payload:
        node_id = node_data.node_id
        seen_keys.add(node_id)

        node = existing_nodes.get(node_id)
        if node is None:
            node = WorkflowNode(workflow_id=workflow.id, node_id=node_id)
            db.add(node)

        node.label = node_data.label
        node.node_type = node_data.node_type
        node.position_x = node_data.position_x
        node.position_y = node_data.position_y
        node.config = node_data.config or {}

    for key, node in existing_nodes.items():
        if key not in seen_keys:
            db.delete(node)

    db.flush()

    # Replace edges to keep things simple
    db.query(WorkflowEdge).filter(WorkflowEdge.workflow_id == workflow.id).delete()

    for edge_data in edges_payload:
        db.add(
            WorkflowEdge(
                workflow_id=workflow.id,
                edge_id=edge_data.edge_id or f"{edge_data.source_node_id}->{edge_data.target_node_id}",
                source_node_id=edge_data.source_node_id,
                target_node_id=edge_data.target_node_id,
                label=edge_data.label,
            )
        )


def _ensure_example_workflow(db: Session, project_id: int) -> Workflow:
    workflow = Workflow(
        project_id=project_id,
        name="Terraform → Cost → Security → Notify",
        description="Sample workflow combining Terraform validate, Infracost, Tfsec and Slack notification.",
    )
    db.add(workflow)
    db.flush()

    nodes = [
        WorkflowNode(
            workflow_id=workflow.id,
            node_id="validate",
            label="Terraform Validate",
            node_type="terraform_validate",
            position_x=0,
            position_y=0,
        ),
        WorkflowNode(
            workflow_id=workflow.id,
            node_id="cost",
            label="Cost estimation",
            node_type="infracost_estimate",
            position_x=260,
            position_y=-140,
        ),
        WorkflowNode(
            workflow_id=workflow.id,
            node_id="security",
            label="Security check",
            node_type="tfsec_scan",
            position_x=260,
            position_y=0,
        ),
        WorkflowNode(
            workflow_id=workflow.id,
            node_id="compliance",
            label="CIS benchmark",
            node_type="terrascan_scan",
            position_x=260,
            position_y=140,
        ),
        WorkflowNode(
            workflow_id=workflow.id,
            node_id="notify",
            label="Cloud architects",
            node_type="email_notification",
            position_x=540,
            position_y=0,
        ),
        WorkflowNode(
            workflow_id=workflow.id,
            node_id="apply",
            label="Apply on approval",
            node_type="terraform_apply",
            position_x=820,
            position_y=0,
        ),
    ]

    for node in nodes:
        db.add(node)
    db.flush()

    edges = [
        WorkflowEdge(
            workflow_id=workflow.id,
            edge_id="validate->cost",
            source_node_id="validate",
            target_node_id="cost",
        ),
        WorkflowEdge(
            workflow_id=workflow.id,
            edge_id="validate->security",
            source_node_id="validate",
            target_node_id="security",
        ),
        WorkflowEdge(
            workflow_id=workflow.id,
            edge_id="validate->compliance",
            source_node_id="validate",
            target_node_id="compliance",
        ),
        WorkflowEdge(
            workflow_id=workflow.id,
            edge_id="cost->notify",
            source_node_id="cost",
            target_node_id="notify",
        ),
        WorkflowEdge(
            workflow_id=workflow.id,
            edge_id="security->notify",
            source_node_id="security",
            target_node_id="notify",
        ),
        WorkflowEdge(
            workflow_id=workflow.id,
            edge_id="compliance->notify",
            source_node_id="compliance",
            target_node_id="notify",
        ),
        WorkflowEdge(
            workflow_id=workflow.id,
            edge_id="notify->apply",
            source_node_id="notify",
            target_node_id="apply",
        ),
    ]

    for edge in edges:
        db.add(edge)

    db.commit()
    db.refresh(workflow)
    return workflow


@router.get("/workflows", response_model=List[WorkflowResponse])
def list_workflows(project_id: int, db: Session = Depends(get_db)):
    workflows = db.query(Workflow).filter(Workflow.project_id == project_id).all()
    if not workflows:
        workflows = [_ensure_example_workflow(db, project_id)]
    return workflows


@router.get("/workflows/node-types")
def list_node_types():
    """Expose registered workflow node types for the UI palette."""
    node_types = []
    for node_type in node_registry.list_all().values():
        node_types.append(
            {
                "type_id": node_type.type_id,
                "display_name": node_type.display_name,
                "category": node_type.category,
                "icon": node_type.icon,
                "description": node_type.description,
                "docker_image": node_type.docker_image,
                "config_schema": node_type.config_schema,
            }
        )
    return {"node_types": node_types}


@router.post("/workflows", response_model=WorkflowResponse)
def create_workflow(payload: WorkflowCreate, db: Session = Depends(get_db)):
    workflow = Workflow(
        project_id=payload.project_id,
        name=payload.name,
        description=payload.description or "",
        enabled=payload.enabled,
    )
    db.add(workflow)
    db.flush()

    _sync_nodes_and_edges(db, workflow, payload.nodes, payload.edges)
    db.commit()
    db.refresh(workflow)
    return workflow


@router.get("/workflows/{workflow_id}", response_model=WorkflowResponse)
def get_workflow(workflow_id: int, db: Session = Depends(get_db)):
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.patch("/workflows/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(workflow_id: int, payload: WorkflowUpdate, db: Session = Depends(get_db)):
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    if payload.name is not None:
        workflow.name = payload.name
    if payload.description is not None:
        workflow.description = payload.description
    if payload.enabled is not None:
        workflow.enabled = payload.enabled
    if payload.nodes is not None and payload.edges is not None:
        _sync_nodes_and_edges(db, workflow, payload.nodes, payload.edges)

    workflow.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(workflow)
    return workflow


@router.delete("/workflows/{workflow_id}")
def delete_workflow(workflow_id: int, db: Session = Depends(get_db)):
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    db.delete(workflow)
    db.commit()
    return {"message": "Workflow deleted"}


@router.post("/workflows/{workflow_id}/validate")
def validate_workflow(workflow_id: int, db: Session = Depends(get_db)):
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    node_dicts = [
        {
            "node_id": node.node_id,
            "node_type": node.node_type,
        }
        for node in workflow.nodes
    ]
    edge_dicts = [
        {
            "source_node_id": edge.source_node_id,
            "target_node_id": edge.target_node_id,
        }
        for edge in workflow.edges
    ]

    dag = DAGEngine(node_dicts, edge_dicts)
    is_valid, error = dag.validate()
    execution_order = None
    if is_valid:
        try:
            execution_order = dag.topological_sort()
        except Exception:
            execution_order = None

    return {"valid": is_valid, "error": error, "execution_order": execution_order}


@router.post("/workflows/{workflow_id}/run", response_model=WorkflowRunResponse)
def trigger_workflow_run(workflow_id: int, payload: WorkflowRunRequest, db: Session = Depends(get_db)):
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    run = WorkflowRun(
        workflow_id=workflow_id,
        triggered_by_user_id=payload.triggered_by_user_id,
        status=WorkflowRunStatus.PENDING,
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    execute_workflow_task.apply_async(args=[run.id])

    return run


@router.get("/workflow-runs/{run_id}", response_model=WorkflowRunResponse)
def get_workflow_run(run_id: int, db: Session = Depends(get_db)):
    run = db.query(WorkflowRun).filter(WorkflowRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Workflow run not found")
    return run
