"""
Configuration Validation Endpoints.

Provides endpoints to validate current configuration and get environment info.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
import os

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.api.endpoints.auth import get_current_user
from app.models import User

router = APIRouter()


class ConfigCheckResult(BaseModel):
    """Individual configuration check result."""
    key: str
    status: str  # valid, missing, invalid
    message: Optional[str] = None
    required: bool = True


class ConfigValidationResponse(BaseModel):
    """Configuration validation response."""
    valid: bool
    checked_at: str
    environment: Optional[str] = None
    results: List[ConfigCheckResult]


class EnvironmentResponse(BaseModel):
    """Environment information response."""
    environment: str
    version: str
    build_date: Optional[str] = None
    features: Dict[str, bool]


def check_required_config(name: str, value: Any, required: bool = True) -> ConfigCheckResult:
    """Check if a required configuration value is set."""
    if value is None or value == "":
        return ConfigCheckResult(
            key=name,
            status="missing" if required else "valid",
            message="Required value not set" if required else "Optional value not set",
            required=required,
        )

    # For secrets, check they're not default/placeholder values
    if name.lower().endswith(("_key", "_secret", "_password")):
        if value in ("changeme", "secret", "password", "default", "test"):
            return ConfigCheckResult(
                key=name,
                status="invalid",
                message="Value appears to be a placeholder",
                required=required,
            )

    return ConfigCheckResult(
        key=name,
        status="valid",
        required=required,
    )


def check_url_config(name: str, value: Any, required: bool = True) -> ConfigCheckResult:
    """Check if a URL configuration is valid."""
    if value is None or value == "":
        return ConfigCheckResult(
            key=name,
            status="missing" if required else "valid",
            message="URL not configured" if required else "Optional URL not set",
            required=required,
        )

    # Basic URL validation
    if not value.startswith(("http://", "https://", "postgresql://", "redis://")):
        return ConfigCheckResult(
            key=name,
            status="invalid",
            message="Invalid URL format",
            required=required,
        )

    return ConfigCheckResult(
        key=name,
        status="valid",
        required=required,
    )


@router.get(
    "/validate",
    response_model=ConfigValidationResponse,
    summary="Validate current configuration",
    description="Returns validation status for all required configuration settings. Admin only.",
)
def validate_config(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConfigValidationResponse:
    """Validate current configuration settings."""
    # This endpoint should be admin-only in production
    # For now, allow any authenticated user

    results: List[ConfigCheckResult] = []

    # Required configurations
    results.append(check_url_config("DATABASE_URL", settings.DATABASE_URL, required=True))
    results.append(check_required_config("SECRET_KEY", settings.SECRET_KEY, required=True))

    # Optional but recommended configurations
    results.append(check_url_config("REDIS_URL", getattr(settings, 'REDIS_URL', None), required=False))
    results.append(check_required_config("INFRACOST_API_KEY", getattr(settings, 'INFRACOST_API_KEY', None), required=False))
    results.append(check_required_config("ANTHROPIC_API_KEY", getattr(settings, 'ANTHROPIC_API_KEY', None), required=False))

    # Check for sensitive values in logs/debug mode
    environment = getattr(settings, 'ENVIRONMENT', 'development')
    if environment == 'production':
        debug_mode = getattr(settings, 'DEBUG', False)
        if debug_mode:
            results.append(ConfigCheckResult(
                key="DEBUG",
                status="invalid",
                message="DEBUG should be disabled in production",
                required=True,
            ))
        else:
            results.append(ConfigCheckResult(
                key="DEBUG",
                status="valid",
                required=True,
            ))

    # Determine overall validity
    is_valid = all(
        r.status == "valid" or (r.status == "missing" and not r.required)
        for r in results
    )

    return ConfigValidationResponse(
        valid=is_valid,
        checked_at=datetime.utcnow().isoformat() + "Z",
        environment=environment,
        results=results,
    )


@router.get(
    "/environment",
    response_model=EnvironmentResponse,
    summary="Get current environment info",
    description="Returns non-sensitive environment information",
)
def get_environment() -> EnvironmentResponse:
    """Get current environment information."""
    environment = getattr(settings, 'ENVIRONMENT', 'development')
    version = getattr(settings, 'APP_VERSION', '1.0.0')

    # Feature flags from settings or environment
    features = {
        "terraform_v2": True,
        "ai_assistant": bool(getattr(settings, 'ANTHROPIC_API_KEY', None)),
        "cost_estimation": bool(getattr(settings, 'INFRACOST_API_KEY', None)),
        "security_scanning": True,
        "multi_cloud": True,
    }

    return EnvironmentResponse(
        environment=environment,
        version=version,
        build_date=os.environ.get('BUILD_DATE'),
        features=features,
    )
