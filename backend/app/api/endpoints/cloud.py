from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.api.endpoints.auth import get_current_user
from app.models import User
from app.models.project import CloudProvider
from app.schemas.cloud import (
    ArchitectureTemplate,
    CloudProviderSummary,
    CloudResourceCatalog,
    TemplateList,
)
from app.services.cloud.aws_catalog import (
    get_aws_categories,
    get_aws_resources,
    get_aws_template,
    get_aws_templates,
)

router = APIRouter()


@router.get("/providers", response_model=List[CloudProviderSummary])
def list_providers(current_user: User = Depends(get_current_user)):
    """List supported cloud providers. Currently focused on AWS."""
    return [
        {
            "id": CloudProvider.AWS,
            "name": "Amazon Web Services",
            "regions": ["us-east-1", "eu-west-1", "ap-south-1"],
            "services": ["networking", "compute", "containers", "security", "data", "serverless"],
        }
    ]


@router.get("/providers/aws/resources", response_model=CloudResourceCatalog)
def aws_resource_catalog(current_user: User = Depends(get_current_user)):
    """Best-practice AWS resource catalog grouped by category."""
    return {
        "provider": CloudProvider.AWS,
        "categories": get_aws_categories(),
        "resources": get_aws_resources(),
    }


@router.get("/providers/aws/templates", response_model=TemplateList)
def aws_template_catalog(current_user: User = Depends(get_current_user)):
    """AWS reference architectures that can seed new diagrams."""
    return {
        "provider": CloudProvider.AWS,
        "templates": get_aws_templates(),
    }


@router.get("/providers/aws/templates/{template_id}", response_model=ArchitectureTemplate)
def aws_template_detail(template_id: str, current_user: User = Depends(get_current_user)):
    """Fetch a single AWS template."""
    template = get_aws_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

