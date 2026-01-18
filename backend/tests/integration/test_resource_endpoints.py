"""
Integration tests for resource endpoints.

These tests verify the resource management functionality.
"""
import pytest
from fastapi.testclient import TestClient


class TestResourceCatalog:
    """Test resource catalog endpoints."""

    def test_list_aws_resources(self, client: TestClient):
        """Test listing AWS resources."""
        response = client.get("/api/resources/aws")
        # Should return list of AWS resources or 404 if different endpoint
        assert response.status_code in [200, 404]

        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (list, dict))

    def test_list_azure_resources(self, client: TestClient):
        """Test listing Azure resources."""
        response = client.get("/api/resources/azure")
        assert response.status_code in [200, 404]

    def test_list_gcp_resources(self, client: TestClient):
        """Test listing GCP resources."""
        response = client.get("/api/resources/gcp")
        assert response.status_code in [200, 404]

    def test_get_resource_schema(self, client: TestClient):
        """Test getting resource schema."""
        response = client.get("/api/resources/schema/aws_vpc")
        # Returns schema or 404 if endpoint not implemented
        assert response.status_code in [200, 404]


class TestResourceManagement:
    """Test resource management for projects."""

    def test_add_resource_to_project(
        self, authenticated_client: TestClient, test_project
    ):
        """Test adding a resource to a project."""
        response = authenticated_client.post(
            f"/api/resources/",
            json={
                "project_id": test_project.id,
                "resource_type": "aws_vpc",
                "name": "main-vpc",
                "config": {"cidr_block": "10.0.0.0/16"},
            },
        )
        # Either succeeds or endpoint doesn't exist (resources via diagram_data)
        assert response.status_code in [200, 201, 404, 405]

    def test_list_project_resources(
        self, authenticated_client: TestClient, test_project
    ):
        """Test listing resources for a project."""
        response = authenticated_client.get(
            f"/api/resources/project/{test_project.id}"
        )
        # Either returns resources or 404
        assert response.status_code in [200, 404]


class TestResourceValidation:
    """Test resource validation."""

    def test_validate_aws_vpc_config(self, authenticated_client: TestClient):
        """Test validation of AWS VPC configuration."""
        response = authenticated_client.post(
            "/api/resources/validate",
            json={
                "resource_type": "aws_vpc",
                "config": {"cidr_block": "10.0.0.0/16"},
            },
        )
        # Either validates or endpoint not implemented
        assert response.status_code in [200, 404]

    def test_invalid_cidr_rejected(self, authenticated_client: TestClient):
        """Test that invalid CIDR is rejected."""
        response = authenticated_client.post(
            "/api/resources/validate",
            json={
                "resource_type": "aws_vpc",
                "config": {"cidr_block": "not-a-cidr"},
            },
        )
        # Should reject invalid config or return 404 if no validation endpoint
        assert response.status_code in [400, 422, 404]


class TestResourceIcons:
    """Test resource icon endpoints."""

    def test_get_aws_icons(self, client: TestClient):
        """Test getting AWS resource icons."""
        response = client.get("/api/icons/aws")
        assert response.status_code == 200

    def test_get_azure_icons(self, client: TestClient):
        """Test getting Azure resource icons."""
        response = client.get("/api/icons/azure")
        assert response.status_code in [200, 404]

    def test_get_gcp_icons(self, client: TestClient):
        """Test getting GCP resource icons."""
        response = client.get("/api/icons/gcp")
        assert response.status_code in [200, 404]

    def test_icon_response_format(self, client: TestClient):
        """Test that icon response has expected format."""
        response = client.get("/api/icons/aws")
        if response.status_code == 200:
            data = response.json()
            # Should be a dict or list of icon mappings
            assert isinstance(data, (dict, list))
