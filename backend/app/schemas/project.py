from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any, List, TYPE_CHECKING
from app.models.project import CloudProvider

if TYPE_CHECKING:
    from app.schemas.resource import Resource


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    cloud_provider: CloudProvider


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cloud_provider: Optional[CloudProvider] = None
    diagram_data: Optional[Dict[str, Any]] = None
    git_repo_url: Optional[str] = None
    git_branch: Optional[str] = None


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
