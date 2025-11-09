from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Pipeline, PipelineRun, PipelineRunStatus, StageRun, Approval, ApprovalStatus
from app.schemas import (
    PipelineCreate,
    PipelineUpdate,
    PipelineResponse,
    PipelineRunCreate,
    PipelineRunResponse,
    StageRunResponse,
    ApprovalRequest,
)
from app.tasks.orchestrator import run_pipeline_orchestrator
from datetime import datetime

router = APIRouter()


@router.get("/projects/{project_id}/pipeline", response_model=PipelineResponse)
def get_or_create_project_pipeline(project_id: int, db: Session = Depends(get_db)):
    """Get or create default pipeline for a project"""
    pipeline = db.query(Pipeline).filter(Pipeline.project_id == project_id).first()

    if not pipeline:
        # Create default pipeline
        pipeline = Pipeline(
            project_id=project_id,
            name="Default Pipeline",
            enabled=True,
        )
        db.add(pipeline)
        db.commit()
        db.refresh(pipeline)

    return pipeline


@router.patch("/pipelines/{pipeline_id}", response_model=PipelineResponse)
def update_pipeline(pipeline_id: int, update: PipelineUpdate, db: Session = Depends(get_db)):
    """Update pipeline configuration"""
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    if update.name is not None:
        pipeline.name = update.name
    if update.enabled is not None:
        pipeline.enabled = update.enabled
    if update.stages_config is not None:
        pipeline.stages_config = update.stages_config

    pipeline.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(pipeline)

    return pipeline


@router.post("/pipelines/{pipeline_id}/runs", response_model=PipelineRunResponse)
def trigger_pipeline_run(
    pipeline_id: int, run_create: PipelineRunCreate, db: Session = Depends(get_db)
):
    """Trigger a new pipeline run"""
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    if not pipeline.enabled:
        raise HTTPException(status_code=400, detail="Pipeline is disabled")

    # Create pipeline run
    run = PipelineRun(
        pipeline_id=pipeline_id,
        triggered_by_user_id=run_create.triggered_by_user_id,
        status=PipelineRunStatus.PENDING,
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # Trigger Celery orchestrator task
    run_pipeline_orchestrator.apply_async(args=[run.id])

    return run


@router.get("/runs/{run_id}", response_model=PipelineRunResponse)
def get_run_status(run_id: int, db: Session = Depends(get_db)):
    """Get pipeline run status and stage details"""
    run = db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Pipeline run not found")

    return run


@router.get("/pipelines/{pipeline_id}/runs", response_model=List[PipelineRunResponse])
def get_pipeline_runs(pipeline_id: int, limit: int = 10, db: Session = Depends(get_db)):
    """Get recent pipeline runs"""
    runs = (
        db.query(PipelineRun)
        .filter(PipelineRun.pipeline_id == pipeline_id)
        .order_by(PipelineRun.started_at.desc())
        .limit(limit)
        .all()
    )
    return runs


@router.post("/stage-runs/{stage_run_id}/approve")
def approve_stage(stage_run_id: int, request: ApprovalRequest, db: Session = Depends(get_db)):
    """Approve a manual approval stage"""
    stage_run = db.query(StageRun).filter(StageRun.id == stage_run_id).first()
    if not stage_run:
        raise HTTPException(status_code=404, detail="Stage run not found")

    if stage_run.stage_name != "approval":
        raise HTTPException(status_code=400, detail="Not an approval stage")

    # Get or create approval record
    approval = db.query(Approval).filter(Approval.stage_run_id == stage_run_id).first()
    if not approval:
        approval = Approval(stage_run_id=stage_run_id)
        db.add(approval)

    approval.status = ApprovalStatus.APPROVED
    approval.approved_by_user_id = request.user_id
    approval.approved_at = datetime.utcnow()

    db.commit()

    return {"message": "Stage approved", "approval_id": approval.id}


@router.post("/stage-runs/{stage_run_id}/reject")
def reject_stage(stage_run_id: int, request: ApprovalRequest, db: Session = Depends(get_db)):
    """Reject a manual approval stage"""
    stage_run = db.query(StageRun).filter(StageRun.id == stage_run_id).first()
    if not stage_run:
        raise HTTPException(status_code=404, detail="Stage run not found")

    if stage_run.stage_name != "approval":
        raise HTTPException(status_code=400, detail="Not an approval stage")

    # Get or create approval record
    approval = db.query(Approval).filter(Approval.stage_run_id == stage_run_id).first()
    if not approval:
        approval = Approval(stage_run_id=stage_run_id)
        db.add(approval)

    approval.status = ApprovalStatus.REJECTED
    approval.approved_by_user_id = request.user_id
    approval.approved_at = datetime.utcnow()
    approval.rejection_reason = request.reason

    db.commit()

    return {"message": "Stage rejected", "approval_id": approval.id}
