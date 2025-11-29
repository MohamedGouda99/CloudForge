from __future__ import annotations
from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, Dict, Any, List, TYPE_CHECKING
import re
from app.models.project import CloudProvider

if TYPE_CHECKING:
    from app.schemas.resource import Resource


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    cloud_provider: CloudProvider

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 1:
            raise ValueError('Project name is required')
        if len(v) > 100:
            raise ValueError('Project name must not exceed 100 characters')
        if not re.match(r'^[a-zA-Z0-9\s_-]+$', v):
            raise ValueError('Project name can only contain letters, numbers, spaces, underscores and hyphens')
        return v

    @field_validator('description')
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) > 500:
                raise ValueError('Project description must not exceed 500 characters')
        return v


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cloud_provider: Optional[CloudProvider] = None
    diagram_data: Optional[Dict[str, Any]] = None
    git_repo_url: Optional[str] = None
    git_branch: Optional[str] = None

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) > 100:
                raise ValueError('Project name must not exceed 100 characters')
            if not re.match(r'^[a-zA-Z0-9\s_-]+$', v):
                raise ValueError('Project name can only contain letters, numbers, spaces, underscores and hyphens')
        return v

    @field_validator('description')
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) > 500:
                raise ValueError('Project description must not exceed 500 characters')
        return v

    @field_validator('git_repo_url')
    @classmethod
    def validate_git_repo_url(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) > 500:
                raise ValueError('Git repository URL must not exceed 500 characters')
            if not re.match(r'^https?://|^git@', v):
                raise ValueError('Git repository URL must be a valid HTTP/HTTPS or SSH URL')
        return v

    @field_validator('git_branch')
    @classmethod
    def validate_git_branch(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) > 100:
                raise ValueError('Git branch name must not exceed 100 characters')
        return v


class ProjectInDB(ProjectBase):
    id: int
    owner_id: int
    diagram_data: Dict[str, Any]
    git_repo_url: Optional[str]
    git_branch: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Project(ProjectInDB):
    pass


class ProjectWithResources(Project):
    resources: List[Resource] = []

    class Config:
        from_attributes = True
