from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.terraform import DriftScanStatus


class TerraformGenerate(BaseModel):
    project_id: int


class TerraformOutput(BaseModel):
    id: int
    project_id: int
    main_tf: str
    variables_tf: Optional[str]
    outputs_tf: Optional[str]
    providers_tf: str
    version: int
    created_at: datetime

    class Config:
        from_attributes = True


class DriftScanCreate(BaseModel):
    project_id: int


class DriftScan(BaseModel):
    id: int
    project_id: int
    status: DriftScanStatus
    result: Optional[str]
    error_message: Optional[str]
    started_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True
