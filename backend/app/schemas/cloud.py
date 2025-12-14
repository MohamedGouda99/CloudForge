from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from app.models.project import CloudProvider


class CloudProviderSummary(BaseModel):
    id: CloudProvider
    name: str
    regions: List[str] = []
    services: List[str] = []


class CloudResource(BaseModel):
    id: str = Field(..., description="Stable identifier, e.g. aws_vpc")
    name: str
    category: str
    service: str
    terraform_type: str
    icon: Optional[str] = None
    description: Optional[str] = None
    best_practices: List[str] = []
    connects_to: List[str] = []
    defaults: Dict[str, Any] = {}


class CloudResourceCatalog(BaseModel):
    provider: CloudProvider
    categories: List[Dict[str, str]]
    resources: List[CloudResource]


class ArchitectureTemplate(BaseModel):
    id: str
    name: str
    description: str
    use_case: str
    maturity: str = "ga"
    services: List[str]
    diagram_data: Optional[Dict[str, Any]] = None
    compliance: List[str] = []
    cost_tier: Optional[str] = None


class TemplateList(BaseModel):
    provider: CloudProvider
    templates: List[ArchitectureTemplate]

