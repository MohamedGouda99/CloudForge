"""
Prometheus Metrics Endpoint.

Exposes application metrics in Prometheus format for scraping.
"""

from fastapi import APIRouter, Request
from fastapi.responses import Response
from prometheus_client import (
    Counter,
    Histogram,
    Gauge,
    generate_latest,
    CONTENT_TYPE_LATEST,
    CollectorRegistry,
    multiprocess,
)
import os

router = APIRouter()

# Create a custom registry for metrics
# This avoids issues with default registry in multiprocess environments
if 'prometheus_multiproc_dir' in os.environ:
    registry = CollectorRegistry()
    multiprocess.MultiProcessCollector(registry)
else:
    registry = CollectorRegistry(auto_describe=True)

# HTTP Request Metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status'],
    registry=registry,
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency in seconds',
    ['method', 'endpoint'],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
    registry=registry,
)

http_requests_in_progress = Gauge(
    'http_requests_in_progress',
    'Number of HTTP requests currently being processed',
    ['method', 'endpoint'],
    registry=registry,
)

# Application Metrics
projects_total = Gauge(
    'cloudforge_projects_total',
    'Total number of projects',
    registry=registry,
)

terraform_generations_total = Counter(
    'cloudforge_terraform_generations_total',
    'Total Terraform generation operations',
    ['status', 'provider'],
    registry=registry,
)

terraform_deployments_total = Counter(
    'cloudforge_terraform_deployments_total',
    'Total Terraform deployment operations',
    ['status', 'action'],
    registry=registry,
)

security_scans_total = Counter(
    'cloudforge_security_scans_total',
    'Total security scan operations',
    ['tool', 'status'],
    registry=registry,
)

# Database Metrics
db_connections_active = Gauge(
    'cloudforge_db_connections_active',
    'Number of active database connections',
    registry=registry,
)

db_query_duration_seconds = Histogram(
    'cloudforge_db_query_duration_seconds',
    'Database query duration in seconds',
    ['operation'],
    buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0],
    registry=registry,
)


@router.get(
    "",
    summary="Prometheus metrics",
    description="Exposes application metrics in Prometheus format for scraping",
    response_class=Response,
)
def get_metrics():
    """Return Prometheus metrics in text format."""
    metrics_output = generate_latest(registry)
    return Response(
        content=metrics_output,
        media_type=CONTENT_TYPE_LATEST,
    )


# Helper functions to record metrics from other parts of the application

def record_http_request(method: str, endpoint: str, status_code: int, duration: float):
    """Record HTTP request metrics."""
    # Normalize endpoint to avoid high cardinality
    normalized_endpoint = normalize_endpoint(endpoint)
    http_requests_total.labels(method=method, endpoint=normalized_endpoint, status=str(status_code)).inc()
    http_request_duration_seconds.labels(method=method, endpoint=normalized_endpoint).observe(duration)


def normalize_endpoint(endpoint: str) -> str:
    """Normalize endpoint path to reduce metric cardinality."""
    # Replace numeric IDs with placeholder
    import re
    # Replace /api/projects/123 -> /api/projects/{id}
    normalized = re.sub(r'/\d+', '/{id}', endpoint)
    # Remove query strings
    normalized = normalized.split('?')[0]
    return normalized


def record_terraform_generation(status: str, provider: str):
    """Record Terraform generation operation."""
    terraform_generations_total.labels(status=status, provider=provider).inc()


def record_terraform_deployment(status: str, action: str):
    """Record Terraform deployment operation."""
    terraform_deployments_total.labels(status=status, action=action).inc()


def record_security_scan(tool: str, status: str):
    """Record security scan operation."""
    security_scans_total.labels(tool=tool, status=status).inc()


def set_project_count(count: int):
    """Set total project count gauge."""
    projects_total.set(count)


def set_db_connections(count: int):
    """Set active database connections gauge."""
    db_connections_active.set(count)


def record_db_query(operation: str, duration: float):
    """Record database query duration."""
    db_query_duration_seconds.labels(operation=operation).observe(duration)
