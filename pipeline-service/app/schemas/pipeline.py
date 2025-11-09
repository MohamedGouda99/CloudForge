from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class PipelineCreate(BaseModel):
    project_id: int
    name: str = "Default Pipeline"
    enabled: bool = True
    stages_config: Optional[Dict[str, Any]] = None


class PipelineUpdate(BaseModel):
    name: Optional[str] = None
    enabled: Optional[bool] = None
    stages_config: Optional[Dict[str, Any]] = None


class PipelineResponse(BaseModel):
    id: int
    project_id: int
    name: str
    enabled: bool
    stages_config: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
