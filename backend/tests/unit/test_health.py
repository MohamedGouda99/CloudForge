"""
Unit tests for health check endpoints.
"""
import pytest
from fastapi.testclient import TestClient


class TestHealthEndpoints:
    """Test suite for health check endpoints."""

    def test_health_endpoint_returns_200_when_healthy(self, client: TestClient):
        """Test basic health endpoint returns healthy status."""
        response = client.get("/api/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "uptime_seconds" in data

    def test_liveness_endpoint_always_returns_alive(self, client: TestClient):
        """Test liveness endpoint always returns alive=true."""
        response = client.get("/api/health/live")

        assert response.status_code == 200
        data = response.json()
        assert data["alive"] is True
        assert "timestamp" in data

    def test_readiness_endpoint_checks_dependencies(self, client: TestClient):
        """Test readiness endpoint includes dependency checks."""
        response = client.get("/api/health/ready")

        assert response.status_code == 200
        data = response.json()
        assert "ready" in data
        assert "checks" in data
        assert "database" in data["checks"]

    def test_readiness_database_check_includes_latency(self, client: TestClient):
        """Test readiness database check includes latency measurement."""
        response = client.get("/api/health/ready")

        assert response.status_code == 200
        data = response.json()
        db_check = data["checks"]["database"]
        assert "status" in db_check
        # In test environment with SQLite, we should have latency
        if db_check["status"] == "healthy":
            assert "latency_ms" in db_check


class TestMetricsEndpoint:
    """Test suite for Prometheus metrics endpoint."""

    def test_metrics_endpoint_returns_prometheus_format(self, client: TestClient):
        """Test metrics endpoint returns Prometheus text format."""
        response = client.get("/metrics")

        assert response.status_code == 200
        # Prometheus format should be text/plain with specific content type
        assert "text/plain" in response.headers.get("content-type", "")

    def test_metrics_include_http_metrics(self, client: TestClient):
        """Test metrics include HTTP request metrics."""
        # Make a request first to generate some metrics
        client.get("/api/health")

        response = client.get("/metrics")
        content = response.text

        # Check for expected metric names
        assert "http_requests_total" in content or "cloudforge" in content


class TestConfigEndpoints:
    """Test suite for configuration endpoints."""

    def test_environment_endpoint_returns_info(self, client: TestClient):
        """Test environment endpoint returns environment info."""
        response = client.get("/api/config/environment")

        assert response.status_code == 200
        data = response.json()
        assert "environment" in data
        assert "version" in data
        assert "features" in data

    def test_environment_features_are_booleans(self, client: TestClient):
        """Test environment features are all boolean values."""
        response = client.get("/api/config/environment")

        data = response.json()
        for key, value in data["features"].items():
            assert isinstance(value, bool), f"Feature {key} should be boolean"

    def test_config_validate_requires_authentication(self, client: TestClient):
        """Test config validation endpoint requires authentication."""
        response = client.get("/api/config/validate")

        # Should return 401 Unauthorized without token
        assert response.status_code == 401

    def test_config_validate_with_auth(self, authenticated_client: TestClient):
        """Test config validation with authentication."""
        response = authenticated_client.get("/api/config/validate")

        assert response.status_code == 200
        data = response.json()
        assert "valid" in data
        assert "results" in data
        assert "checked_at" in data
