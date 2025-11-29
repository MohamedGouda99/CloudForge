import os
import json
import time
from pathlib import Path
from celery import shared_task
from app.services.ai.claude import generate_framework_plan
from app.services.terraform.generator import TerraformGenerator
from app.models.project import CloudProvider, Project
from app.models.resource import Resource


def _to_cloud_provider(value: str | None) -> CloudProvider:
    if not value:
        return CloudProvider.AWS
    v = value.lower()
    if v in ("aws", "amazon", "amazon web services"):
        return CloudProvider.AWS
    if v in ("azure", "microsoft"):
        return CloudProvider.AZURE
    if v in ("gcp", "google", "google cloud"):
        return CloudProvider.GCP
    return CloudProvider.AWS


def _plan_to_resources(plan: dict) -> tuple[Project, list[Resource]]:
    provider = _to_cloud_provider(plan.get("cloud_provider"))
    project = Project(name=plan.get("title", "ai-framework"), cloud_provider=provider)
    resources: list[Resource] = []
    for mod in plan.get("modules", []):
        for res in mod.get("resources", []):
            r = Resource(
                project_id=0,
                resource_type=res.get("type", "aws_s3_bucket"),
                resource_name=res.get("name", "resource"),
                node_id=f"ai_{int(time.time()*1000)}_{len(resources)}",
                position_x=0,
                position_y=0,
                config=res.get("config") or {},
            )
            resources.append(r)
    return project, resources


@shared_task(name="ai.build_framework_from_guide")
def build_framework_from_guide(guide_text: str, cloud_provider: str | None = None) -> dict:
    plan = generate_framework_plan(guide_text, cloud_provider)

    base_dir = Path("app/generated_terraform/frameworks")
    os.makedirs(base_dir, exist_ok=True)
    slug = str(int(time.time()))
    out_dir = base_dir / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    plan_path = out_dir / "plan.json"
    plan_path.write_text(json.dumps(plan, indent=2))

    project, resources = _plan_to_resources(plan)
    tg = TerraformGenerator()
    files = tg.generate_terraform(project, resources)
    for name, content in files.items():
        (out_dir / name).write_text(content)

    return {
        "slug": slug,
        "path": str(out_dir),
        "cloud_provider": project.cloud_provider.value,
        "files": list(files.keys()),
    }
