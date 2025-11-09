from __future__ import annotations

from datetime import datetime
import os

from app.core.celery_app import celery_app
from app.core.config import settings
from app.core.database import SessionLocal
from app.models import PipelineRun, StageRun, StageRunStatus
from app.utils import run_cli_command, stream_log


def get_terraform_dir(run_id: int) -> str:
    """Return and ensure the terraform workspace directory for the project tied to the run."""
    db = SessionLocal()
    try:
        run = db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
        if not run:
            raise ValueError(f"Pipeline run {run_id} not found")

        project_id = run.pipeline.project_id
        workspace_dir = os.path.join(settings.terraform_workspace_dir, f"project_{project_id}")
        os.makedirs(workspace_dir, exist_ok=True)
        return workspace_dir
    finally:
        db.close()


def create_stage_run(run_id: int, stage_name: str) -> int:
    """Create a stage run entry to track execution."""
    db = SessionLocal()
    try:
        stage_run = StageRun(
            pipeline_run_id=run_id,
            stage_name=stage_name,
            status=StageRunStatus.RUNNING,
            started_at=datetime.utcnow(),
        )
        db.add(stage_run)
        db.commit()
        db.refresh(stage_run)
        return stage_run.id
    finally:
        db.close()


def update_stage_run(stage_run_id: int, status: str, logs: str = "", output_data: dict | None = None):
    """Persist the latest state/logs for a stage run."""
    db = SessionLocal()
    try:
        stage_run = db.query(StageRun).filter(StageRun.id == stage_run_id).first()
        if stage_run:
            stage_run.status = StageRunStatus(status)
            if logs:
                stage_run.logs = (stage_run.logs or "") + logs + "\n"
            if output_data is not None:
                stage_run.output_data = output_data
            stage_run.completed_at = datetime.utcnow()
            if stage_run.started_at:
                duration = (stage_run.completed_at - stage_run.started_at).total_seconds()
                stage_run.duration_seconds = int(duration)
            db.commit()
    finally:
        db.close()


def run_terraform_validate(run_id: int) -> dict:
    """Execute terraform init/validate synchronously and stream logs."""
    stream_log(run_id, None, "Starting Terraform validation...")
    stage_run_id = create_stage_run(run_id, "validate")
    terraform_dir = get_terraform_dir(run_id)

    try:
        stream_log(run_id, stage_run_id, "Running terraform init...")
        init_result = run_cli_command(
            ["terraform", "init"],
            cwd=terraform_dir,
            log_callback=lambda log: stream_log(run_id, stage_run_id, log),
        )
        if not init_result.success:
            update_stage_run(stage_run_id, "failed", init_result.stderr)
            return {"success": False, "error": "terraform init failed"}

        stream_log(run_id, stage_run_id, "Running terraform validate...")
        validate_result = run_cli_command(
            ["terraform", "validate"],
            cwd=terraform_dir,
            log_callback=lambda log: stream_log(run_id, stage_run_id, log),
        )
        if validate_result.success:
            update_stage_run(stage_run_id, "success", validate_result.stdout)
            stream_log(run_id, stage_run_id, "Terraform validation passed")
            return {"success": True}

        update_stage_run(stage_run_id, "failed", validate_result.stderr)
        stream_log(run_id, stage_run_id, "Terraform validation failed")
        return {"success": False, "error": validate_result.stderr}

    except Exception as exc:
        error_msg = f"Validation failed: {exc}"
        update_stage_run(stage_run_id, "failed", error_msg)
        stream_log(run_id, stage_run_id, error_msg)
        return {"success": False, "error": error_msg}


@celery_app.task(bind=True)
def terraform_validate_task(self, run_id: int):
    """Celery wrapper so the task can still be queued independently."""
    return run_terraform_validate(run_id)


def run_terraform_apply(run_id: int) -> dict:
    """Execute terraform apply synchronously and stream logs."""
    stream_log(run_id, None, "Starting Terraform apply...")
    stage_run_id = create_stage_run(run_id, "apply")
    terraform_dir = get_terraform_dir(run_id)

    try:
        stream_log(run_id, stage_run_id, "Running terraform apply -auto-approve...")
        apply_result = run_cli_command(
            ["terraform", "apply", "-auto-approve"],
            cwd=terraform_dir,
            log_callback=lambda log: stream_log(run_id, stage_run_id, log),
        )
        if apply_result.success:
            update_stage_run(stage_run_id, "success", apply_result.stdout)
            stream_log(run_id, stage_run_id, "Terraform apply completed successfully")
            return {"success": True}

        update_stage_run(stage_run_id, "failed", apply_result.stderr)
        stream_log(run_id, stage_run_id, "Terraform apply failed")
        return {"success": False, "error": apply_result.stderr}

    except Exception as exc:
        error_msg = f"Apply failed: {exc}"
        update_stage_run(stage_run_id, "failed", error_msg)
        stream_log(run_id, stage_run_id, error_msg)
        return {"success": False, "error": error_msg}


@celery_app.task(bind=True)
def terraform_apply_task(self, run_id: int):
    """Celery wrapper so the task can still be queued independently."""
    return run_terraform_apply(run_id)
