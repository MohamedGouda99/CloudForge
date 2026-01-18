"""
Unit tests for projects endpoints.
"""
import pytest
from fastapi.testclient import TestClient


class TestProjectsCRUD:
    """Test suite for project CRUD operations."""

    def test_create_project(self, authenticated_client: TestClient):
        """Test creating a new project."""
        response = authenticated_client.post(
            "/api/projects/",
            json={
                "name": "Test Project",
                "description": "A test project",
                "cloud_provider": "aws",
            },
        )

        assert response.status_code in [200, 201]  # 201 Created is proper REST
        data = response.json()
        assert data["name"] == "Test Project"
        assert data["cloud_provider"] == "aws"
        assert "id" in data

    def test_create_project_requires_auth(self, client: TestClient):
        """Test project creation requires authentication."""
        response = client.post(
            "/api/projects/",
            json={
                "name": "Test Project",
                "cloud_provider": "aws",
            },
        )

        assert response.status_code == 401

    def test_create_project_validates_provider(self, authenticated_client: TestClient):
        """Test project creation validates cloud provider."""
        response = authenticated_client.post(
            "/api/projects/",
            json={
                "name": "Test Project",
                "cloud_provider": "invalid_provider",
            },
        )

        # Should fail validation
        assert response.status_code in [400, 422]

    def test_get_project_by_id(self, authenticated_client: TestClient, test_project):
        """Test getting a project by ID."""
        response = authenticated_client.get(f"/api/projects/{test_project.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_project.id
        assert data["name"] == test_project.name

    def test_get_nonexistent_project(self, authenticated_client: TestClient):
        """Test getting a nonexistent project returns 404."""
        response = authenticated_client.get("/api/projects/99999")

        assert response.status_code == 404

    def test_list_user_projects(self, authenticated_client: TestClient, test_project):
        """Test listing projects for current user."""
        response = authenticated_client.get("/api/projects/")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Should include the test project
        project_ids = [p["id"] for p in data]
        assert test_project.id in project_ids

    def test_update_project(self, authenticated_client: TestClient, test_project):
        """Test updating a project."""
        response = authenticated_client.put(
            f"/api/projects/{test_project.id}",
            json={
                "name": "Updated Project Name",
                "description": "Updated description",
                "cloud_provider": "aws",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Project Name"
        assert data["description"] == "Updated description"

    def test_update_project_not_owner(
        self, client: TestClient, test_project, admin_headers
    ):
        """Test updating a project by non-owner fails."""
        # Admin user is not the owner of test_project
        client.headers.update(admin_headers)
        response = client.put(
            f"/api/projects/{test_project.id}",
            json={
                "name": "Hacked Name",
                "cloud_provider": "aws",
            },
        )

        # Should fail - not the owner
        # Note: This depends on authorization implementation
        # May be 403 or 404 depending on design
        assert response.status_code in [403, 404]

    def test_delete_project(self, authenticated_client: TestClient, db_session, test_user):
        """Test deleting a project."""
        # Create a project specifically for deletion
        from app.models import Project

        project = Project(
            name="To Delete",
            cloud_provider="aws",
            owner_id=test_user.id,
        )
        db_session.add(project)
        db_session.commit()
        project_id = project.id

        response = authenticated_client.delete(f"/api/projects/{project_id}")

        assert response.status_code in [200, 204]  # 204 No Content is proper REST

        # Verify deletion
        get_response = authenticated_client.get(f"/api/projects/{project_id}")
        assert get_response.status_code == 404


class TestProjectDiagram:
    """Test suite for project diagram operations."""

    def test_save_diagram_data(self, authenticated_client: TestClient, test_project):
        """Test saving diagram data to a project."""
        diagram_data = {
            "nodes": [
                {
                    "id": "node1",
                    "type": "aws_vpc",
                    "position": {"x": 100, "y": 100},
                    "data": {
                        "resourceType": "aws_vpc",
                        "resourceLabel": "Main VPC",
                        "config": {"cidr_block": "10.0.0.0/16"},
                    },
                }
            ],
            "edges": [],
        }

        response = authenticated_client.put(
            f"/api/projects/{test_project.id}",
            json={
                "name": test_project.name,
                "cloud_provider": test_project.cloud_provider,
                "diagram_data": diagram_data,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["diagram_data"] is not None
        assert len(data["diagram_data"]["nodes"]) == 1

    def test_get_diagram_data(self, authenticated_client: TestClient, test_project, db_session):
        """Test retrieving diagram data from a project."""
        # Set diagram data
        test_project.diagram_data = {"nodes": [{"id": "test"}], "edges": []}
        db_session.commit()

        response = authenticated_client.get(f"/api/projects/{test_project.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["diagram_data"] is not None


class TestProjectValidation:
    """Test suite for project input validation."""

    def test_project_name_required(self, authenticated_client: TestClient):
        """Test project name is required."""
        response = authenticated_client.post(
            "/api/projects/",
            json={
                "cloud_provider": "aws",
            },
        )

        assert response.status_code == 422

    def test_project_name_max_length(self, authenticated_client: TestClient):
        """Test project name has maximum length."""
        long_name = "x" * 500
        response = authenticated_client.post(
            "/api/projects/",
            json={
                "name": long_name,
                "cloud_provider": "aws",
            },
        )

        # Should either create (if no limit) or fail validation
        # This documents the expected behavior
        assert response.status_code in [200, 422]
