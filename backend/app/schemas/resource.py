from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, Dict, Any
import re


class ResourceBase(BaseModel):
    resource_type: str
    resource_name: str
    config: Dict[str, Any] = {}

    @field_validator('resource_type')
    @classmethod
    def validate_resource_type(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Resource type is required')
        if len(v) > 100:
            raise ValueError('Resource type must not exceed 100 characters')
        return v

    @field_validator('resource_name')
    @classmethod
    def validate_resource_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Resource name is required')
        if len(v) > 100:
            raise ValueError('Resource name must not exceed 100 characters')
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Resource name can only contain letters, numbers, underscores and hyphens')
        return v

    @field_validator('config')
    @classmethod
    def validate_config(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        if v is None:
            return {}
        import json
        try:
            json.dumps(v)
        except (TypeError, ValueError):
            raise ValueError('Config must be JSON serializable')
        return v


class ResourceCreate(ResourceBase):
    project_id: int
    node_id: str
    position_x: int
    position_y: int

    @field_validator('node_id')
    @classmethod
    def validate_node_id(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Node ID is required')
        if len(v) > 100:
            raise ValueError('Node ID must not exceed 100 characters')
        return v

    @field_validator('position_x', 'position_y')
    @classmethod
    def validate_position(cls, v: int) -> int:
        if v < -10000 or v > 100000:
            raise ValueError('Position must be between -10000 and 100000')
        return v


class ResourceUpdate(BaseModel):
    resource_name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    position_x: Optional[int] = None
    position_y: Optional[int] = None

    @field_validator('resource_name')
    @classmethod
    def validate_resource_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) > 100:
                raise ValueError('Resource name must not exceed 100 characters')
            if not re.match(r'^[a-zA-Z0-9_-]+$', v):
                raise ValueError('Resource name can only contain letters, numbers, underscores and hyphens')
        return v

    @field_validator('position_x', 'position_y')
    @classmethod
    def validate_position(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < -10000 or v > 100000):
            raise ValueError('Position must be between -10000 and 100000')
        return v


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

    @field_validator('connection_type')
    @classmethod
    def validate_connection_type(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Connection type is required')
        if len(v) > 50:
            raise ValueError('Connection type must not exceed 50 characters')
        return v


class Connection(BaseModel):
    id: int
    source_id: int
    target_id: int
    connection_type: str
    created_at: datetime

    class Config:
        from_attributes = True
