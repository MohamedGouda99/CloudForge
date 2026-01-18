"""
Unit tests for authentication endpoints.
"""
import pytest
from fastapi.testclient import TestClient


class TestAuthLogin:
    """Test suite for login endpoint."""

    def test_login_with_valid_credentials(self, client: TestClient, test_user):
        """Test successful login with valid credentials."""
        response = client.post(
            "/api/auth/login",
            data={
                "username": "testuser",
                "password": "testpassword123",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_with_invalid_password(self, client: TestClient, test_user):
        """Test login fails with wrong password."""
        response = client.post(
            "/api/auth/login",
            data={
                "username": "testuser",
                "password": "wrongpassword",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    def test_login_with_nonexistent_user(self, client: TestClient):
        """Test login fails with nonexistent username."""
        response = client.post(
            "/api/auth/login",
            data={
                "username": "nonexistent",
                "password": "anypassword",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert response.status_code == 401

    def test_login_returns_jwt_format(self, client: TestClient, test_user):
        """Test login returns properly formatted JWT."""
        response = client.post(
            "/api/auth/login",
            data={
                "username": "testuser",
                "password": "testpassword123",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        data = response.json()
        token = data["access_token"]
        # JWT has three parts separated by dots
        parts = token.split(".")
        assert len(parts) == 3


class TestAuthRegister:
    """Test suite for registration endpoint."""

    def test_register_new_user(self, client: TestClient):
        """Test successful user registration."""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "securepassword123",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert "id" in data

    def test_register_duplicate_username(self, client: TestClient, test_user):
        """Test registration fails with duplicate username."""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "testuser",
                "email": "different@example.com",
                "password": "securepassword123",
            },
        )

        assert response.status_code == 400

    def test_register_duplicate_email(self, client: TestClient, test_user):
        """Test registration fails with duplicate email."""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "differentuser",
                "email": "test@example.com",
                "password": "securepassword123",
            },
        )

        assert response.status_code == 400


class TestAuthCurrentUser:
    """Test suite for current user endpoint."""

    def test_get_current_user_with_valid_token(self, authenticated_client: TestClient):
        """Test getting current user with valid token."""
        response = authenticated_client.get("/api/auth/me")

        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert "email" in data

    def test_get_current_user_without_token(self, client: TestClient):
        """Test getting current user without token fails."""
        response = client.get("/api/auth/me")

        assert response.status_code == 401

    def test_get_current_user_with_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token fails."""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid.token.here"},
        )

        assert response.status_code == 401
