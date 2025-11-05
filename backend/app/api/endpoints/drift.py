from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.endpoints.auth import get_current_user
from app.models import User, Project, DriftScan as DriftScanModel, DriftScanStatus
from app.schemas import DriftScan, DriftScanCreate

router = APIRouter()


@router.post("/scan/{project_id}", response_model=DriftScan, status_code=status.HTTP_202_ACCEPTED)
def start_drift_scan(
    project_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a drift detection scan for a project"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Create drift scan record
    drift_scan = DriftScanModel(
        project_id=project_id,
        status=DriftScanStatus.PENDING
    )

    db.add(drift_scan)
    db.commit()
    db.refresh(drift_scan)

    # Schedule background task
    # background_tasks.add_task(run_drift_scan, drift_scan.id)

    return drift_scan


@router.get("/scan/{scan_id}", response_model=DriftScan)
def get_drift_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get drift scan results"""
    scan = db.query(DriftScanModel).join(Project).filter(
        DriftScanModel.id == scan_id,
        Project.owner_id == current_user.id
    ).first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drift scan not found"
        )

    return scan


@router.get("/project/{project_id}/scans", response_model=List[DriftScan])
def list_project_scans(
    project_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all drift scans for a project"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    scans = db.query(DriftScanModel).filter(
        DriftScanModel.project_id == project_id
    ).order_by(DriftScanModel.started_at.desc()).offset(skip).limit(limit).all()

    return scans
