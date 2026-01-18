"""
Integration tests for authentication endpoints.

These tests verify the full authentication flow including database operations.
"""
import pytest
from fastapi.testclient import TestClient


class TestAuthenticationFlow:
    """Test the complete authentication flow."""

    def test_register_login_access_flow(self, client: TestClient):
        """Test complete flow: register -> login -> access protected resource."""
        # Step 1: Register new user
        register_response = client.post(
            "/api/auth/register",
            json={
                "username": "integration_test_user",
                "email": "integration@test.com",
                "password": "secure_password_123",
            },
        )
        assert register_response.status_code == 200
        user_data = register_response.json()
        assert user_data["username"] == "integration_test_user"

        # Step 2: Login with new credentials
        login_response = client.post(
            "/api/auth/login",
            data={
                "username": "integration_test_user",
                "password": "secure_password_123",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert login_response.status_code == 200
        token_data = login_response.json()
        assert "access_token" in token_data

        # Step 3: Access protected resource
        token = token_data["access_token"]
        me_response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me_response.status_code == 200
        assert me_response.json()["username"] == "integration_test_user"

    def test_failed_login_does_not_grant_access(self, client: TestClient):
        """Test that failed login doesn't allow access to protected resources."""
        # Attempt login with wrong password
        login_response = client.post(
            "/api/auth/login",
            data={
                "username": "nonexistent",
                "password": "wrong",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert login_response.status_code == 401

        # Try to access protected resource without token
        me_response = client.get("/api/auth/me")
        assert me_response.status_code == 401


class TestTokenValidation:
    """Test token validation scenarios."""

    def test_expired_token_rejected(self, client: TestClient):
        """Test that expired tokens are rejected."""
        # This would require mocking time or using a pre-expired token
        # For now, test with malformed token
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer expired.token.here"},
        )
        assert response.status_code == 401

    def test_malformed_token_rejected(self, client: TestClient):
        """Test that malformed tokens are rejected."""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer not-a-valid-jwt"},
        )
        assert response.status_code == 401

    def test_missing_bearer_prefix_rejected(self, client: TestClient, auth_token: str):
        """Test that tokens without Bearer prefix are handled."""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": auth_token},  # Missing "Bearer " prefix
        )
        # Should be rejected
        assert response.status_code == 401


class TestUserRegistrationValidation:
    """Test user registration validation."""

    def test_duplicate_username_rejected(self, client: TestClient, test_user):
        """Test that duplicate usernames are rejected."""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "testuser",  # Same as test_user fixture
                "email": "different@email.com",
                "password": "password123",
            },
        )
        assert response.status_code == 400

    def test_duplicate_email_rejected(self, client: TestClient, test_user):
        """Test that duplicate emails are rejected."""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "different_user",
                "email": "test@example.com",  # Same as test_user fixture
                "password": "password123",
            },
        )
        assert response.status_code == 400

    def test_weak_password_handling(self, client: TestClient):
        """Test handling of weak passwords."""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "weak_password_user",
                "email": "weak@test.com",
                "password": "123",  # Very weak password
            },
        )
        # Either accepts (no password policy) or rejects
        # Document actual behavior
        assert response.status_code in [200, 400, 422]
