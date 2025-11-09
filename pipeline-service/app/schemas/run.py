from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class PipelineRunCreate(BaseModel):
    triggered_by_user_id: int


class StageRunResponse(BaseModel):
    id: int
    stage_name: str
    status: str
    logs: str
    output_data: Optional[Dict[str, Any]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None

    class Config:
        from_attributes = True


class PipelineRunResponse(BaseModel):
    id: int
    pipeline_id: int
    status: str
    triggered_by_user_id: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    stage_runs: List[StageRunResponse] = []

    class Config:
        from_attributes = True


class ApprovalRequest(BaseModel):
    user_id: int
    reason: Optional[str] = None
