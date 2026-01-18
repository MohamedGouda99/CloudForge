"""
Locust load testing for CloudForge API.

Run with:
    locust -f tests/load/locustfile.py --headless -u 100 -r 10 -t 60s --host http://localhost:8000

Or with web UI:
    locust -f tests/load/locustfile.py --host http://localhost:8000
"""

import json
import random
from locust import HttpUser, task, between, tag


class CloudForgeUser(HttpUser):
    """Simulates a typical CloudForge user."""

    wait_time = between(1, 3)
    token = None
    project_id = None

    def on_start(self):
        """Login and setup test data at start of user session."""
        # Register a unique user for this locust instance
        username = f"loadtest_{random.randint(10000, 99999)}"
        email = f"{username}@loadtest.example.com"
        password = "loadtest123"

        # Try to register
        self.client.post(
            "/api/auth/register",
            json={
                "username": username,
                "email": email,
                "password": password,
            },
        )

        # Login
        response = self.client.post(
            "/api/auth/login",
            data={
                "username": username,
                "password": password,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        if response.status_code == 200:
            data = response.json()
            self.token = data["access_token"]

            # Create a test project
            response = self.client.post(
                "/api/projects/",
                json={
                    "name": f"Load Test Project {random.randint(1000, 9999)}",
                    "description": "Project for load testing",
                    "cloud_provider": "aws",
                },
                headers={"Authorization": f"Bearer {self.token}"},
            )
            if response.status_code == 200:
                self.project_id = response.json()["id"]

    @tag("health")
    @task(10)
    def health_check(self):
        """Health check - high frequency, low cost."""
        self.client.get("/api/health")

    @tag("health")
    @task(3)
    def readiness_check(self):
        """Readiness check - medium frequency."""
        self.client.get("/api/health/ready")

    @tag("auth")
    @task(2)
    def get_current_user(self):
        """Get current user info."""
        if self.token:
            self.client.get(
                "/api/auth/me",
                headers={"Authorization": f"Bearer {self.token}"},
            )

    @tag("projects")
    @task(5)
    def list_projects(self):
        """List user's projects."""
        if self.token:
            self.client.get(
                "/api/projects/",
                headers={"Authorization": f"Bearer {self.token}"},
            )

    @tag("projects")
    @task(3)
    def get_project(self):
        """Get a specific project."""
        if self.token and self.project_id:
            self.client.get(
                f"/api/projects/{self.project_id}",
                headers={"Authorization": f"Bearer {self.token}"},
            )

    @tag("projects")
    @task(2)
    def update_project_diagram(self):
        """Update project diagram data."""
        if self.token and self.project_id:
            diagram_data = {
                "nodes": [
                    {
                        "id": f"vpc_{random.randint(1, 1000)}",
                        "type": "aws_vpc",
                        "position": {"x": random.randint(0, 1000), "y": random.randint(0, 1000)},
                        "data": {
                            "resourceType": "aws_vpc",
                            "resourceLabel": "VPC",
                            "config": {"cidr_block": "10.0.0.0/16"},
                        },
                    }
                ],
                "edges": [],
            }

            self.client.put(
                f"/api/projects/{self.project_id}",
                json={
                    "name": "Load Test Project",
                    "cloud_provider": "aws",
                    "diagram_data": diagram_data,
                },
                headers={"Authorization": f"Bearer {self.token}"},
            )

    @tag("terraform")
    @task(1)
    def generate_terraform(self):
        """Generate Terraform code - expensive operation."""
        if self.token and self.project_id:
            self.client.post(
                f"/api/terraform/generate/{self.project_id}",
                headers={"Authorization": f"Bearer {self.token}"},
            )

    @tag("dashboard")
    @task(2)
    def get_dashboard_stats(self):
        """Get dashboard statistics."""
        if self.token:
            self.client.get(
                "/api/dashboard/stats",
                headers={"Authorization": f"Bearer {self.token}"},
            )


class HealthCheckUser(HttpUser):
    """User that only performs health checks - for infrastructure testing."""

    wait_time = between(0.1, 0.5)

    @task
    def health(self):
        """Basic health check."""
        self.client.get("/api/health")

    @task
    def live(self):
        """Liveness check."""
        self.client.get("/api/health/live")


class HeavyUser(HttpUser):
    """Simulates heavy API usage for stress testing."""

    wait_time = between(0.5, 1)
    weight = 1  # Lower weight - fewer of these users
    token = None

    def on_start(self):
        """Setup for heavy user."""
        username = f"heavy_{random.randint(10000, 99999)}"
        self.client.post(
            "/api/auth/register",
            json={
                "username": username,
                "email": f"{username}@loadtest.example.com",
                "password": "loadtest123",
            },
        )
        response = self.client.post(
            "/api/auth/login",
            data={"username": username, "password": "loadtest123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if response.status_code == 200:
            self.token = response.json()["access_token"]

    @task(3)
    def create_and_delete_project(self):
        """Create and immediately delete a project - tests transaction handling."""
        if not self.token:
            return

        # Create
        response = self.client.post(
            "/api/projects/",
            json={
                "name": f"Temp Project {random.randint(1, 10000)}",
                "cloud_provider": random.choice(["aws", "azure", "gcp"]),
            },
            headers={"Authorization": f"Bearer {self.token}"},
        )

        if response.status_code == 200:
            project_id = response.json()["id"]
            # Delete
            self.client.delete(
                f"/api/projects/{project_id}",
                headers={"Authorization": f"Bearer {self.token}"},
            )

    @task(1)
    def rapid_list_projects(self):
        """Rapidly list projects multiple times."""
        if self.token:
            for _ in range(5):
                self.client.get(
                    "/api/projects/",
                    headers={"Authorization": f"Bearer {self.token}"},
                )
