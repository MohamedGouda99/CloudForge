from __future__ import annotations

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class WorkflowNodeSchema(BaseModel):
    id: Optional[int] = None
    node_id: str
    node_type: str
    label: str
    position_x: float
    position_y: float
    config: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        from_attributes = True


class WorkflowEdgeSchema(BaseModel):
    id: Optional[int] = None
    edge_id: str
    source_node_id: str
    target_node_id: str
    label: Optional[str] = None

    class Config:
        from_attributes = True


class WorkflowCreate(BaseModel):
    project_id: int
    name: str
    description: Optional[str] = ""
    enabled: bool = True
    nodes: List[WorkflowNodeSchema] = Field(default_factory=list)
    edges: List[WorkflowEdgeSchema] = Field(default_factory=list)


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    enabled: Optional[bool] = None
    nodes: Optional[List[WorkflowNodeSchema]] = None
    edges: Optional[List[WorkflowEdgeSchema]] = None


class WorkflowResponse(BaseModel):
    id: int
    project_id: int
    name: str
    description: Optional[str]
    enabled: bool
    created_at: datetime
    updated_at: datetime
    nodes: List[WorkflowNodeSchema]
    edges: List[WorkflowEdgeSchema]

    class Config:
        from_attributes = True


class WorkflowRunRequest(BaseModel):
    triggered_by_user_id: Optional[int] = None


class WorkflowNodeRunResponse(BaseModel):
    id: int
    workflow_node_id: Optional[int]
    status: str
    logs: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class WorkflowRunResponse(BaseModel):
    id: int
    workflow_id: int
    status: str
    error_message: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    node_runs: List[WorkflowNodeRunResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
