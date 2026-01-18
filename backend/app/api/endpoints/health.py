"""
Health Check Endpoints for Production Monitoring.

Implements:
- /api/health - Basic health check for load balancer probes
- /api/health/ready - Readiness check (DB connected, dependencies available)
- /api/health/live - Liveness check (process is alive)
"""

import time
from datetime import datetime
from typing import Dict, Any, Optional

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.core.config import settings

router = APIRouter()

# Track application start time
APP_START_TIME = time.time()


class DependencyCheck(BaseModel):
    """Individual dependency check result."""
    status: str  # healthy, unhealthy, degraded
    latency_ms: Optional[float] = None
    message: Optional[str] = None


class HealthResponse(BaseModel):
    """Basic health response."""
    status: str  # healthy, unhealthy
    timestamp: str
    version: Optional[str] = None
    uptime_seconds: Optional[float] = None


class ReadinessResponse(BaseModel):
    """Readiness check response."""
    ready: bool
    checks: Dict[str, DependencyCheck]


class LivenessResponse(BaseModel):
    """Liveness check response."""
    alive: bool
    timestamp: str


def check_database(db: Session) -> DependencyCheck:
    """Check database connectivity and measure latency."""
    start = time.time()
    try:
        db.execute(text("SELECT 1"))
        latency_ms = (time.time() - start) * 1000
        return DependencyCheck(
            status="healthy",
            latency_ms=round(latency_ms, 2),
        )
    except Exception as e:
        latency_ms = (time.time() - start) * 1000
        return DependencyCheck(
            status="unhealthy",
            latency_ms=round(latency_ms, 2),
            message=str(e)[:100],
        )


def check_redis() -> DependencyCheck:
    """Check Redis connectivity if configured."""
    if not settings.REDIS_URL:
        return DependencyCheck(
            status="healthy",
            message="Redis not configured (optional)",
        )

    start = time.time()
    try:
        import redis
        client = redis.from_url(settings.REDIS_URL, socket_timeout=2)
        client.ping()
        latency_ms = (time.time() - start) * 1000
        return DependencyCheck(
            status="healthy",
            latency_ms=round(latency_ms, 2),
        )
    except Exception as e:
        latency_ms = (time.time() - start) * 1000
        return DependencyCheck(
            status="degraded",  # Redis is optional, so degraded not unhealthy
            latency_ms=round(latency_ms, 2),
            message=str(e)[:100],
        )


@router.get(
    "",
    response_model=HealthResponse,
    responses={
        200: {"description": "Service is healthy"},
        503: {"description": "Service is unhealthy"},
    },
    summary="Basic health check",
    description="Returns service health status for load balancer probes",
)
def get_health(db: Session = Depends(get_db)) -> JSONResponse:
    """Basic health check for load balancer probes."""
    # Check critical dependency: database
    db_check = check_database(db)

    is_healthy = db_check.status == "healthy"
    uptime = time.time() - APP_START_TIME

    response = HealthResponse(
        status="healthy" if is_healthy else "unhealthy",
        timestamp=datetime.utcnow().isoformat() + "Z",
        version=settings.APP_VERSION if hasattr(settings, 'APP_VERSION') else "1.0.0",
        uptime_seconds=round(uptime, 2),
    )

    status_code = status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(content=response.model_dump(), status_code=status_code)


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    responses={
        200: {"description": "Service is ready"},
        503: {"description": "Service is not ready"},
    },
    summary="Readiness check",
    description="Returns whether service is ready to accept traffic (DB connected, dependencies available)",
)
def get_readiness(db: Session = Depends(get_db)) -> JSONResponse:
    """Readiness check - verifies all dependencies are available."""
    checks: Dict[str, DependencyCheck] = {}

    # Check database
    checks["database"] = check_database(db)

    # Check Redis (optional)
    checks["redis"] = check_redis()

    # Determine overall readiness
    # Ready if database is healthy (Redis is optional)
    is_ready = checks["database"].status == "healthy"

    response = ReadinessResponse(
        ready=is_ready,
        checks=checks,
    )

    status_code = status.HTTP_200_OK if is_ready else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(
        content={
            "ready": response.ready,
            "checks": {k: v.model_dump() for k, v in response.checks.items()},
        },
        status_code=status_code,
    )


@router.get(
    "/live",
    response_model=LivenessResponse,
    summary="Liveness check",
    description="Returns whether service process is alive (for container restart decisions)",
)
def get_liveness() -> LivenessResponse:
    """Liveness check - simply confirms the process is responsive."""
    return LivenessResponse(
        alive=True,
        timestamp=datetime.utcnow().isoformat() + "Z",
    )
