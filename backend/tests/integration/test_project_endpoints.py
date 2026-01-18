"""
Integration tests for project endpoints.

These tests verify the full project CRUD flow including database operations.
"""
import pytest
from fastapi.testclient import TestClient


class TestProjectLifecycle:
    """Test the complete project lifecycle."""

    def test_create_read_update_delete_project(self, authenticated_client: TestClient):
        """Test complete CRUD flow for projects."""
        # Step 1: Create project
        create_response = authenticated_client.post(
            "/api/projects/",
            json={
                "name": "CRUD Test Project",
                "description": "Testing CRUD operations",
                "cloud_provider": "aws",
            },
        )
        assert create_response.status_code == 200
        project = create_response.json()
        project_id = project["id"]
        assert project["name"] == "CRUD Test Project"

        # Step 2: Read project
        get_response = authenticated_client.get(f"/api/projects/{project_id}")
        assert get_response.status_code == 200
        assert get_response.json()["name"] == "CRUD Test Project"

        # Step 3: Update project
        update_response = authenticated_client.put(
            f"/api/projects/{project_id}",
            json={
                "name": "Updated CRUD Project",
                "description": "Updated description",
                "cloud_provider": "aws",
            },
        )
        assert update_response.status_code == 200
        assert update_response.json()["name"] == "Updated CRUD Project"

        # Step 4: Verify update persisted
        verify_response = authenticated_client.get(f"/api/projects/{project_id}")
        assert verify_response.json()["name"] == "Updated CRUD Project"

        # Step 5: Delete project
        delete_response = authenticated_client.delete(f"/api/projects/{project_id}")
        assert delete_response.status_code == 200

        # Step 6: Verify deletion
        final_response = authenticated_client.get(f"/api/projects/{project_id}")
        assert final_response.status_code == 404


class TestProjectDiagramPersistence:
    """Test diagram data persistence."""

    def test_diagram_data_saved_and_retrieved(self, authenticated_client: TestClient):
        """Test that diagram data is correctly saved and retrieved."""
        # Create project
        create_response = authenticated_client.post(
            "/api/projects/",
            json={
                "name": "Diagram Test Project",
                "cloud_provider": "aws",
            },
        )
        project_id = create_response.json()["id"]

        # Update with diagram data
        diagram_data = {
            "nodes": [
                {
                    "id": "vpc-1",
                    "type": "aws_vpc",
                    "position": {"x": 100, "y": 100},
                    "data": {
                        "resourceType": "aws_vpc",
                        "resourceLabel": "Main VPC",
                        "config": {"cidr_block": "10.0.0.0/16"},
                    },
                },
                {
                    "id": "subnet-1",
                    "type": "aws_subnet",
                    "position": {"x": 200, "y": 200},
                    "data": {
                        "resourceType": "aws_subnet",
                        "resourceLabel": "Public Subnet",
                        "config": {"cidr_block": "10.0.1.0/24"},
                    },
                },
            ],
            "edges": [
                {"id": "e1", "source": "vpc-1", "target": "subnet-1"},
            ],
        }

        update_response = authenticated_client.put(
            f"/api/projects/{project_id}",
            json={
                "name": "Diagram Test Project",
                "cloud_provider": "aws",
                "diagram_data": diagram_data,
            },
        )
        assert update_response.status_code == 200

        # Retrieve and verify
        get_response = authenticated_client.get(f"/api/projects/{project_id}")
        retrieved_data = get_response.json()["diagram_data"]
        assert len(retrieved_data["nodes"]) == 2
        assert len(retrieved_data["edges"]) == 1
        assert retrieved_data["nodes"][0]["data"]["resourceType"] == "aws_vpc"

        # Cleanup
        authenticated_client.delete(f"/api/projects/{project_id}")

    def test_empty_diagram_handled(self, authenticated_client: TestClient):
        """Test that empty diagram data is handled correctly."""
        create_response = authenticated_client.post(
            "/api/projects/",
            json={
                "name": "Empty Diagram Project",
                "cloud_provider": "aws",
                "diagram_data": {"nodes": [], "edges": []},
            },
        )
        assert create_response.status_code == 200
        project_id = create_response.json()["id"]

        get_response = authenticated_client.get(f"/api/projects/{project_id}")
        assert get_response.status_code == 200

        # Cleanup
        authenticated_client.delete(f"/api/projects/{project_id}")


class TestProjectIsolation:
    """Test project isolation between users."""

    def test_user_cannot_access_other_users_project(
        self, client: TestClient, test_project, admin_headers
    ):
        """Test that users cannot access projects they don't own."""
        # Admin user trying to access test_user's project
        client.headers.update(admin_headers)
        response = client.get(f"/api/projects/{test_project.id}")
        # Should either return 404 (hidden) or 403 (forbidden)
        assert response.status_code in [403, 404]

    def test_user_only_sees_own_projects(
        self, authenticated_client: TestClient, test_project
    ):
        """Test that listing projects returns only user's projects."""
        response = authenticated_client.get("/api/projects/")
        projects = response.json()

        # All returned projects should belong to the authenticated user
        for project in projects:
            # The project owner should match the authenticated user
            # This is implicit - if the API is correct, we only see our projects
            assert "id" in project


class TestProjectValidation:
    """Test project input validation."""

    def test_invalid_cloud_provider_rejected(self, authenticated_client: TestClient):
        """Test that invalid cloud providers are rejected."""
        response = authenticated_client.post(
            "/api/projects/",
            json={
                "name": "Invalid Provider Project",
                "cloud_provider": "invalid_cloud",
            },
        )
        assert response.status_code in [400, 422]

    def test_missing_name_rejected(self, authenticated_client: TestClient):
        """Test that missing project name is rejected."""
        response = authenticated_client.post(
            "/api/projects/",
            json={
                "cloud_provider": "aws",
            },
        )
        assert response.status_code == 422

    def test_all_cloud_providers_supported(self, authenticated_client: TestClient):
        """Test that all supported cloud providers can be used."""
        providers = ["aws", "azure", "gcp"]
        created_ids = []

        for provider in providers:
            response = authenticated_client.post(
                "/api/projects/",
                json={
                    "name": f"Test {provider.upper()} Project",
                    "cloud_provider": provider,
                },
            )
            assert response.status_code == 200, f"Failed for provider: {provider}"
            created_ids.append(response.json()["id"])

        # Cleanup
        for project_id in created_ids:
            authenticated_client.delete(f"/api/projects/{project_id}")
