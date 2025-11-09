from __future__ import annotations

import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import Any, Callable, Dict

from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models import (
    Approval,
    ApprovalStatus,
    PipelineRun,
    PipelineRunStatus,
    StageRun,
    StageRunStatus,
)
from app.tasks.analysis import run_infracost_analysis
from app.tasks.security import run_tfsec_scan, run_terrascan_scan
from app.tasks.terraform import (
    create_stage_run,
    run_terraform_apply,
    run_terraform_validate,
    update_stage_run,
)
from app.utils import stream_log


DEFAULT_PIPELINE_CONFIG: Dict[str, Any] = {
    "validate": {"enabled": True, "order": 1},
    "tfsec": {"enabled": True, "order": 2, "parallel_group": "analysis"},
    "terrascan": {"enabled": True, "order": 2, "parallel_group": "analysis"},
    "infracost": {"enabled": True, "order": 2, "parallel_group": "analysis"},
    "approval": {"enabled": True, "order": 3, "require_manual": True},
    "apply": {"enabled": True, "order": 4},
}


def mark_run_status(run_id: int, status: PipelineRunStatus, error_message: str | None = None) -> None:
    """Update pipeline run status in the database."""
    db = SessionLocal()
    try:
        run = db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
        if not run:
            return

        run.status = status
        if error_message:
            run.error_message = error_message

        if status in (PipelineRunStatus.SUCCESS, PipelineRunStatus.FAILED, PipelineRunStatus.CANCELLED):
            run.completed_at = datetime.utcnow()

        db.commit()
    finally:
        db.close()


def wait_for_manual_approval(run_id: int) -> bool:
    """
    Wait for a manual approval.
    Returns True when approved, False when rejected/timeout.
    """
    approval_stage_id = create_stage_run(run_id, "approval")
    db = SessionLocal()
    try:
        approval = Approval(stage_run_id=approval_stage_id, status=ApprovalStatus.PENDING)
        db.add(approval)
        db.commit()
        db.refresh(approval)
        approval_id = approval.id
    finally:
        db.close()

    stream_log(run_id, approval_stage_id, "Manual approval required. Waiting for user action...")
    mark_run_status(run_id, PipelineRunStatus.WAITING_APPROVAL)

    timeout_seconds = 3600  # 1 hour
    poll_interval = 5
    waited = 0

    while waited < timeout_seconds:
        db = SessionLocal()
        try:
            approval = db.query(Approval).filter(Approval.id == approval_id).first()
            if approval:
                if approval.status == ApprovalStatus.APPROVED:
                    update_stage_run(approval_stage_id, StageRunStatus.SUCCESS.value, "Approved by user")
                    stream_log(run_id, approval_stage_id, "Approval received. Continuing pipeline...")
                    mark_run_status(run_id, PipelineRunStatus.RUNNING)
                    return True
                if approval.status == ApprovalStatus.REJECTED:
                    message = approval.rejection_reason or "Rejected by user"
                    update_stage_run(approval_stage_id, StageRunStatus.FAILED.value, message)
                    stream_log(run_id, approval_stage_id, "Pipeline rejected. Stopping execution.")
                    return False
        finally:
            db.close()

        time.sleep(poll_interval)
        waited += poll_interval

    update_stage_run(
        approval_stage_id,
        StageRunStatus.FAILED.value,
        "Approval timed out after 60 minutes.",
    )
    stream_log(run_id, approval_stage_id, "Approval timed out. Cancelling pipeline.")
    return False


@celery_app.task(bind=True, name="pipeline.orchestrator")
def run_pipeline_orchestrator(self, run_id: int):
    """
    Entry point for executing a pipeline run.
    Executes stages sequentially, with the analysis stage running parallel subtasks.
    """
    pipeline_name = "pipeline"
    config: Dict[str, Any] = DEFAULT_PIPELINE_CONFIG.copy()

    db = SessionLocal()
    try:
        run = db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
        if not run:
            raise ValueError(f"Pipeline run {run_id} not found")

        pipeline = run.pipeline
        pipeline_name = pipeline.name
        config = (pipeline.stages_config or DEFAULT_PIPELINE_CONFIG).copy()

        run.status = PipelineRunStatus.RUNNING
        run.started_at = datetime.utcnow()
        db.commit()

    finally:
        db.close()

    stream_log(run_id, None, f"Starting pipeline '{pipeline_name}' (run {run_id})")

    try:
        # Stage 1: Terraform validate
        if config.get("validate", {}).get("enabled", True):
            stream_log(run_id, None, "Stage 1: Terraform validate")
            validate_result = run_terraform_validate(run_id)
            if not validate_result.get("success"):
                mark_run_status(run_id, PipelineRunStatus.FAILED, "Terraform validation failed")
                return {"success": False, "stage": "validate"}

        # Stage 2: Security/Cost analysis (parallel)
        analysis_jobs: list[tuple[str, Callable[[int], dict]]] = []
        if config.get("tfsec", {}).get("enabled", True):
            analysis_jobs.append(("tfsec", run_tfsec_scan))
        if config.get("terrascan", {}).get("enabled", True):
            analysis_jobs.append(("terrascan", run_terrascan_scan))
        if config.get("infracost", {}).get("enabled", True):
            analysis_jobs.append(("infracost", run_infracost_analysis))

        if analysis_jobs:
            stream_log(run_id, None, "Stage 2: Running tfsec / Terrascan / Infracost")
            with ThreadPoolExecutor(max_workers=len(analysis_jobs)) as executor:
                future_to_stage = {executor.submit(job, run_id): stage for stage, job in analysis_jobs}
                for future in as_completed(future_to_stage):
                    stage = future_to_stage[future]
                    try:
                        result = future.result()
                    except Exception as exc:  # pragma: no cover - defensive
                        error_msg = f"{stage} stage crashed: {exc}"
                        mark_run_status(run_id, PipelineRunStatus.FAILED, error_msg)
                        stream_log(run_id, None, error_msg)
                        return {"success": False, "stage": stage, "error": error_msg}

                    if not result.get("success"):
                        error_msg = result.get("error") or f"{stage} stage failed"
                        mark_run_status(run_id, PipelineRunStatus.FAILED, error_msg)
                        stream_log(run_id, None, error_msg)
                        return {"success": False, "stage": stage, "error": error_msg}

        # Stage 3: Manual approval
        if config.get("approval", {}).get("enabled", True):
            approved = wait_for_manual_approval(run_id)
            if not approved:
                mark_run_status(run_id, PipelineRunStatus.CANCELLED, "Pipeline rejected or approval timed out")
                return {"success": False, "stage": "approval"}

        # Stage 4: Terraform apply
        if config.get("apply", {}).get("enabled", True):
            stream_log(run_id, None, "Stage 4: Terraform apply")
            apply_result = run_terraform_apply(run_id)
            if not apply_result.get("success"):
                mark_run_status(run_id, PipelineRunStatus.FAILED, "Terraform apply failed")
                return {"success": False, "stage": "apply"}

        mark_run_status(run_id, PipelineRunStatus.SUCCESS)
        stream_log(run_id, None, "Pipeline completed successfully.")
        return {"success": True}

    except Exception as exc:
        error_msg = f"Pipeline execution failed: {exc}"
        mark_run_status(run_id, PipelineRunStatus.FAILED, error_msg)
        stream_log(run_id, None, error_msg)
        return {"success": False, "error": error_msg}
