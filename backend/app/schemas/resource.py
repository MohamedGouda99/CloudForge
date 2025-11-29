from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any


class ResourceBase(BaseModel):
    resource_type: str
    resource_name: str
    config: Dict[str, Any] = {}


class ResourceCreate(ResourceBase):
    project_id: int
    node_id: str
    position_x: int
    position_y: int


class ResourceUpdate(BaseModel):
    resource_name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    position_x: Optional[int] = None
    position_y: Optional[int] = None


class ResourceInDB(ResourceBase):
    id: int
    project_id: int
    node_id: str
    position_x: int
    position_y: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Resource(ResourceInDB):
    pass


class ConnectionCreate(BaseModel):
    source_id: int
    target_id: int
    connection_type: str


class Connection(BaseModel):
    id: int
    source_id: int
    target_id: int
    connection_type: str
    created_at: datetime

    class Config:
        from_attributes = True
