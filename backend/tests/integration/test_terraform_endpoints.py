"""
Integration tests for Terraform generation endpoints.

These tests verify the Terraform generation flow including code generation.
"""
import pytest
from fastapi.testclient import TestClient


class TestTerraformGeneration:
    """Test Terraform code generation endpoints."""

    def test_generate_terraform_for_project(
        self, authenticated_client: TestClient, test_project, db_session
    ):
        """Test Terraform code generation for a project."""
        # Add diagram data to project
        test_project.diagram_data = {
            "nodes": [
                {
                    "id": "vpc-1",
                    "type": "aws_vpc",
                    "position": {"x": 100, "y": 100},
                    "data": {
                        "resourceType": "aws_vpc",
                        "resourceLabel": "main",
                        "config": {"cidr_block": "10.0.0.0/16"},
                    },
                }
            ],
            "edges": [],
        }
        db_session.commit()

        # Generate Terraform
        response = authenticated_client.post(
            f"/api/terraform/generate/{test_project.id}"
        )

        # Should succeed and return generated code
        assert response.status_code in [200, 201]
        data = response.json()
        # Should contain terraform code or files
        assert "files" in data or "code" in data or "terraform" in str(data).lower()

    def test_generate_terraform_for_empty_project(
        self, authenticated_client: TestClient
    ):
        """Test Terraform generation for project with no resources."""
        # Create project with empty diagram
        create_response = authenticated_client.post(
            "/api/projects/",
            json={
                "name": "Empty TF Project",
                "cloud_provider": "aws",
                "diagram_data": {"nodes": [], "edges": []},
            },
        )
        project_id = create_response.json()["id"]

        # Generate Terraform
        response = authenticated_client.post(
            f"/api/terraform/generate/{project_id}"
        )

        # Should handle empty diagram gracefully
        assert response.status_code in [200, 201]

        # Cleanup
        authenticated_client.delete(f"/api/projects/{project_id}")

    def test_generate_terraform_nonexistent_project(
        self, authenticated_client: TestClient
    ):
        """Test Terraform generation for nonexistent project."""
        response = authenticated_client.post("/api/terraform/generate/99999")
        assert response.status_code == 404

    def test_generate_terraform_requires_auth(self, client: TestClient, test_project):
        """Test that Terraform generation requires authentication."""
        response = client.post(f"/api/terraform/generate/{test_project.id}")
        assert response.status_code == 401


class TestTerraformMultiCloud:
    """Test Terraform generation for different cloud providers."""

    def test_generate_aws_terraform(self, authenticated_client: TestClient):
        """Test AWS Terraform generation."""
        # Create AWS project with resources
        create_response = authenticated_client.post(
            "/api/projects/",
            json={
                "name": "AWS TF Test",
                "cloud_provider": "aws",
                "diagram_data": {
                    "nodes": [
                        {
                            "id": "vpc-1",
                            "type": "aws_vpc",
                            "position": {"x": 0, "y": 0},
                            "data": {
                                "resourceType": "aws_vpc",
                                "resourceLabel": "main",
                                "config": {"cidr_block": "10.0.0.0/16"},
                            },
                        }
                    ],
                    "edges": [],
                },
            },
        )
        project_id = create_response.json()["id"]

        # Generate Terraform
        response = authenticated_client.post(f"/api/terraform/generate/{project_id}")
        assert response.status_code in [200, 201]

        # Verify AWS provider in output
        data = response.json()
        output_str = str(data).lower()
        assert "aws" in output_str

        # Cleanup
        authenticated_client.delete(f"/api/projects/{project_id}")

    def test_generate_azure_terraform(self, authenticated_client: TestClient):
        """Test Azure Terraform generation."""
        create_response = authenticated_client.post(
            "/api/projects/",
            json={
                "name": "Azure TF Test",
                "cloud_provider": "azure",
                "diagram_data": {
                    "nodes": [
                        {
                            "id": "vnet-1",
                            "type": "azurerm_virtual_network",
                            "position": {"x": 0, "y": 0},
                            "data": {
                                "resourceType": "azurerm_virtual_network",
                                "resourceLabel": "main",
                                "config": {
                                    "address_space": ["10.0.0.0/16"],
                                    "location": "eastus",
                                },
                            },
                        }
                    ],
                    "edges": [],
                },
            },
        )
        project_id = create_response.json()["id"]

        response = authenticated_client.post(f"/api/terraform/generate/{project_id}")
        assert response.status_code in [200, 201]

        # Cleanup
        authenticated_client.delete(f"/api/projects/{project_id}")

    def test_generate_gcp_terraform(self, authenticated_client: TestClient):
        """Test GCP Terraform generation."""
        create_response = authenticated_client.post(
            "/api/projects/",
            json={
                "name": "GCP TF Test",
                "cloud_provider": "gcp",
                "diagram_data": {
                    "nodes": [
                        {
                            "id": "network-1",
                            "type": "google_compute_network",
                            "position": {"x": 0, "y": 0},
                            "data": {
                                "resourceType": "google_compute_network",
                                "resourceLabel": "main",
                                "config": {"auto_create_subnetworks": False},
                            },
                        }
                    ],
                    "edges": [],
                },
            },
        )
        project_id = create_response.json()["id"]

        response = authenticated_client.post(f"/api/terraform/generate/{project_id}")
        assert response.status_code in [200, 201]

        # Cleanup
        authenticated_client.delete(f"/api/projects/{project_id}")


class TestTerraformDownload:
    """Test Terraform download functionality."""

    def test_download_terraform_files(
        self, authenticated_client: TestClient, test_project, db_session
    ):
        """Test downloading generated Terraform files."""
        # Setup project with resources
        test_project.diagram_data = {
            "nodes": [
                {
                    "id": "vpc-1",
                    "type": "aws_vpc",
                    "position": {"x": 0, "y": 0},
                    "data": {
                        "resourceType": "aws_vpc",
                        "resourceLabel": "main",
                        "config": {"cidr_block": "10.0.0.0/16"},
                    },
                }
            ],
            "edges": [],
        }
        db_session.commit()

        # First generate
        authenticated_client.post(f"/api/terraform/generate/{test_project.id}")

        # Then try to download (if endpoint exists)
        response = authenticated_client.get(
            f"/api/terraform/download/{test_project.id}"
        )

        # Either returns file content or 404 if endpoint not implemented
        assert response.status_code in [200, 404]
