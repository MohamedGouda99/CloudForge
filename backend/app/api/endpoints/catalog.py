"""
Resource Catalog API Endpoints

Provides REST API access to the unified resource catalog for frontend consumption.
Supports multiple cloud providers: AWS, GCP, Azure.
"""

from typing import List, Optional, Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.terraform.schema_loader import get_schema_loader, SUPPORTED_PROVIDERS

router = APIRouter()

# Valid provider values
ProviderType = Literal["aws", "gcp", "azure"]


# ============================================================================
# Response Models
# ============================================================================


class ValidationRule(BaseModel):
    """Validation rules for an attribute."""

    pattern: Optional[str] = None
    min: Optional[float] = None
    max: Optional[float] = None
    minLength: Optional[int] = None
    maxLength: Optional[int] = None


class InputAttribute(BaseModel):
    """Input attribute definition."""

    name: str
    type: str
    description: str
    example: Optional[str] = None
    default: Optional[object] = None
    options: Optional[List[str]] = None
    reference: Optional[str] = None
    validation: Optional[ValidationRule] = None
    group: Optional[str] = None


class BlockAttribute(BaseModel):
    """Block attribute definition."""

    name: str
    description: str
    required: bool = False
    multiple: bool = False
    attributes: List[InputAttribute] = []


class InputSchema(BaseModel):
    """Input schema for a resource."""

    required: List[InputAttribute] = []
    optional: List[InputAttribute] = []
    blocks: Optional[List[BlockAttribute]] = []


class OutputAttribute(BaseModel):
    """Output attribute definition."""

    name: str
    type: str
    description: str


class TerraformMetadata(BaseModel):
    """Terraform metadata for HCL generation."""

    resourceType: str
    requiredArgs: List[str] = []
    referenceableAttrs: dict = {}


class ResourceDefinition(BaseModel):
    """Complete resource definition."""

    id: str
    terraform_resource: str = Field(..., alias="terraform_resource")
    name: str
    description: str
    icon: str
    category: str
    classification: str
    inputs: InputSchema
    outputs: List[OutputAttribute] = []
    terraform: TerraformMetadata
    relations: Optional[dict] = None
    provider: Optional[str] = None

    class Config:
        populate_by_name = True


class ProviderInfo(BaseModel):
    """Provider metadata."""

    id: str
    name: str
    shortName: str
    resourceCount: int


class CatalogResponse(BaseModel):
    """Response for catalog endpoint."""

    version: str = "5.x"
    lastUpdated: Optional[str] = None
    provider: str = "aws"
    category: Optional[str] = None
    resources: List[ResourceDefinition] = []
    total: int = 0


class ProvidersResponse(BaseModel):
    """Response for providers list endpoint."""

    providers: List[ProviderInfo] = []
    total: int = 0


class ResourceLookupResponse(BaseModel):
    """Response for single resource lookup."""

    found: bool
    resource: Optional[ResourceDefinition] = None


# ============================================================================
# API Endpoints
# ============================================================================


@router.get("/providers", response_model=ProvidersResponse, tags=["catalog"])
async def get_providers() -> ProvidersResponse:
    """
    Get list of all supported cloud providers with metadata.

    Returns provider ID, name, short name, and resource count for each provider.
    """
    schema_loader = get_schema_loader()
    providers_info = schema_loader.get_all_providers_info()

    return ProvidersResponse(
        providers=providers_info,
        total=len(providers_info),
    )


@router.get("/", response_model=CatalogResponse, tags=["catalog"])
async def get_resource_catalog(
    provider: str = Query(default="aws", description="Cloud provider (aws, gcp, azure)"),
    category: Optional[str] = Query(default=None, description="Resource category filter"),
    classification: Optional[str] = Query(
        default=None, description="Classification filter (icon or container)"
    ),
) -> CatalogResponse:
    """
    Get the resource catalog with optional filters.

    - **provider**: Cloud provider (aws, gcp, azure)
    - **category**: Filter by category (compute, containers, etc.)
    - **classification**: Filter by classification (icon or container)
    """
    schema_loader = get_schema_loader()

    # Validate provider
    if provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(
            status_code=400,
            detail=f"Provider '{provider}' not supported. Use one of: {', '.join(SUPPORTED_PROVIDERS)}"
        )

    # Get resources for the specified provider
    resources = schema_loader.get_resources_by_provider(provider)

    # Apply category filter
    if category:
        resources = [r for r in resources if r.get("category") == category]

    # Apply classification filter
    if classification:
        resources = [r for r in resources if r.get("classification") == classification]

    return CatalogResponse(
        version="5.x",
        provider=provider,
        category=category,
        resources=resources,
        total=len(resources),
    )


@router.get(
    "/{terraform_resource}",
    response_model=ResourceLookupResponse,
    tags=["catalog"],
)
async def get_resource_by_type(terraform_resource: str) -> ResourceLookupResponse:
    """
    Get a single resource definition by Terraform resource type.

    - **terraform_resource**: The Terraform resource type (e.g., aws_instance)
    """
    schema_loader = get_schema_loader()
    resource = schema_loader.get_resource(terraform_resource)

    if resource:
        return ResourceLookupResponse(found=True, resource=resource)
    else:
        return ResourceLookupResponse(found=False, resource=None)


@router.get("/containers/list", response_model=List[str], tags=["catalog"])
async def get_container_resource_types() -> List[str]:
    """
    Get a list of all container resource types (resources that can contain children).

    Returns terraform_resource names like ['aws_ecs_cluster', 'aws_eks_cluster'].
    """
    schema_loader = get_schema_loader()
    containers = schema_loader.get_container_resources()
    return [r["terraform_resource"] for r in containers]


@router.get("/icons/list", response_model=List[str], tags=["catalog"])
async def get_icon_resource_types() -> List[str]:
    """
    Get a list of all icon resource types (standalone resources).

    Returns terraform_resource names like ['aws_instance', 'aws_lambda_function'].
    """
    schema_loader = get_schema_loader()
    icons = schema_loader.get_icon_resources()
    return [r["terraform_resource"] for r in icons]


@router.get("/categories/list", response_model=List[str], tags=["catalog"])
async def get_categories(
    provider: Optional[str] = Query(default=None, description="Cloud provider filter (aws, gcp, azure)")
) -> List[str]:
    """
    Get a list of all available resource categories.

    - **provider**: Optional provider filter to get categories for a specific provider
    """
    schema_loader = get_schema_loader()

    if provider:
        if provider not in SUPPORTED_PROVIDERS:
            raise HTTPException(
                status_code=400,
                detail=f"Provider '{provider}' not supported. Use one of: {', '.join(SUPPORTED_PROVIDERS)}"
            )
        resources = schema_loader.get_resources_by_provider(provider)
    else:
        resources = schema_loader.get_all_resources()

    categories = set(r.get("category") for r in resources if r.get("category"))
    return sorted(list(categories))


@router.get("/{terraform_resource}/defaults", tags=["catalog"])
async def get_resource_defaults(terraform_resource: str) -> dict:
    """
    Get all default values for a resource type.

    Returns a dict of argument names to default values.
    """
    schema_loader = get_schema_loader()
    resource = schema_loader.get_resource(terraform_resource)

    if not resource:
        raise HTTPException(
            status_code=404, detail=f"Resource '{terraform_resource}' not found"
        )

    defaults = {}
    inputs = resource.get("inputs", {})

    for attr in inputs.get("required", []):
        if "default" in attr:
            defaults[attr["name"]] = attr["default"]

    for attr in inputs.get("optional", []):
        if "default" in attr:
            defaults[attr["name"]] = attr["default"]

    return defaults


@router.get("/{terraform_resource}/required", response_model=List[str], tags=["catalog"])
async def get_required_args(terraform_resource: str) -> List[str]:
    """
    Get the required arguments for a resource type.
    """
    schema_loader = get_schema_loader()
    required_args = schema_loader.get_required_args(terraform_resource)

    if not required_args:
        # Check if resource exists at all
        resource = schema_loader.get_resource(terraform_resource)
        if not resource:
            raise HTTPException(
                status_code=404, detail=f"Resource '{terraform_resource}' not found"
            )

    return required_args


@router.get("/{terraform_resource}/is-container", tags=["catalog"])
async def check_is_container(terraform_resource: str) -> dict:
    """
    Check if a resource type is a container (can contain children).
    """
    schema_loader = get_schema_loader()
    is_container = schema_loader.is_container_resource(terraform_resource)
    return {"terraform_resource": terraform_resource, "is_container": is_container}


# ============================================================================
# Containment API Endpoints
# ============================================================================


class ContainmentRulesResponse(BaseModel):
    """Response for containment rules endpoint."""

    terraform_resource: str
    is_container: bool
    childTypes: List[str] = []
    description: Optional[str] = None


class ValidateContainmentRequest(BaseModel):
    """Request for validate containment endpoint."""

    container_type: str = Field(..., description="Parent container resource type")
    child_type: str = Field(..., description="Child resource type to validate")


class ValidateContainmentResponse(BaseModel):
    """Response for validate containment endpoint."""

    valid: bool
    warning: Optional[str] = None
    suggestion: Optional[str] = None


@router.get(
    "/containment/{terraform_resource}",
    response_model=ContainmentRulesResponse,
    tags=["catalog"],
)
async def get_containment_rules(terraform_resource: str) -> ContainmentRulesResponse:
    """
    Get containment rules for a container resource.

    Returns valid child types for the specified container.
    """
    schema_loader = get_schema_loader()
    rules = schema_loader.get_containment_rules(terraform_resource)

    if not rules:
        # Check if resource exists
        resource = schema_loader.get_resource(terraform_resource)
        if not resource:
            raise HTTPException(
                status_code=404, detail=f"Resource '{terraform_resource}' not found"
            )
        return ContainmentRulesResponse(
            terraform_resource=terraform_resource,
            is_container=False,
            childTypes=[],
            description=None,
        )

    return ContainmentRulesResponse(
        terraform_resource=terraform_resource,
        is_container=True,
        childTypes=rules.get("childTypes", []),
        description=rules.get("description"),
    )


@router.post(
    "/validate-containment",
    response_model=ValidateContainmentResponse,
    tags=["catalog"],
)
async def validate_containment(
    request: ValidateContainmentRequest,
) -> ValidateContainmentResponse:
    """
    Validate if a child resource can be placed in a container.

    Returns validation result with optional warning and suggestion.
    """
    schema_loader = get_schema_loader()
    result = schema_loader.validate_containment(request.container_type, request.child_type)

    return ValidateContainmentResponse(
        valid=result.get("valid", False),
        warning=result.get("warning"),
        suggestion=result.get("suggestion"),
    )
