"""
Shared pytest fixtures for CloudForge backend tests.
"""
import os
import pytest
from typing import Generator, AsyncGenerator
from unittest.mock import MagicMock, patch
from datetime import timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport

# Set test environment before importing app
os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"

from app.core.database import Base, get_db
from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models import User, Project


# Test database engine with SQLite in-memory
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def override_get_db(db_session: Session):
    """Override the database dependency for testing."""
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass
    return _override_get_db


@pytest.fixture(scope="function")
def client(override_get_db) -> Generator[TestClient, None, None]:
    """Create a test client with database override."""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
async def async_client(override_get_db) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client with database override."""
    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db_session: Session) -> User:
    """Create a test user."""
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpassword123"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def test_admin(db_session: Session) -> User:
    """Create a test admin user."""
    admin = User(
        username="testadmin",
        email="admin@example.com",
        hashed_password=get_password_hash("adminpassword123"),
        is_active=True,
        is_superuser=True,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture(scope="function")
def auth_token(test_user: User) -> str:
    """Create an authentication token for the test user."""
    return create_access_token(
        data={"sub": test_user.username},
        expires_delta=timedelta(hours=1),
    )


@pytest.fixture(scope="function")
def admin_token(test_admin: User) -> str:
    """Create an authentication token for the test admin."""
    return create_access_token(
        data={"sub": test_admin.username},
        expires_delta=timedelta(hours=1),
    )


@pytest.fixture(scope="function")
def auth_headers(auth_token: str) -> dict:
    """Create authorization headers for authenticated requests."""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture(scope="function")
def admin_headers(admin_token: str) -> dict:
    """Create authorization headers for admin requests."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="function")
def authenticated_client(client: TestClient, auth_headers: dict) -> TestClient:
    """Create an authenticated test client."""
    client.headers.update(auth_headers)
    return client


@pytest.fixture(scope="function")
def test_project(db_session: Session, test_user: User) -> Project:
    """Create a test project."""
    project = Project(
        name="Test Project",
        description="A test project for unit testing",
        cloud_provider="aws",
        owner_id=test_user.id,
        diagram_data={"nodes": [], "edges": []},
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project


@pytest.fixture(scope="function")
def mock_redis():
    """Mock Redis client for tests."""
    with patch("redis.Redis") as mock:
        mock_client = MagicMock()
        mock.return_value = mock_client
        mock_client.get.return_value = None
        mock_client.set.return_value = True
        mock_client.delete.return_value = True
        yield mock_client


@pytest.fixture(scope="function")
def mock_celery():
    """Mock Celery for async task tests."""
    with patch("celery.Celery") as mock:
        mock_app = MagicMock()
        mock.return_value = mock_app
        yield mock_app


@pytest.fixture(scope="function")
def mock_anthropic():
    """Mock Anthropic API client for AI assistant tests."""
    with patch("anthropic.Anthropic") as mock:
        mock_client = MagicMock()
        mock.return_value = mock_client
        mock_client.messages.create.return_value = MagicMock(
            content=[MagicMock(text="Test AI response")]
        )
        yield mock_client


@pytest.fixture(scope="function")
def sample_diagram_data() -> dict:
    """Sample diagram data for testing."""
    return {
        "nodes": [
            {
                "id": "vpc-1",
                "type": "aws_vpc",
                "position": {"x": 100, "y": 100},
                "data": {
                    "label": "Main VPC",
                    "properties": {"cidr_block": "10.0.0.0/16"},
                },
            },
            {
                "id": "subnet-1",
                "type": "aws_subnet",
                "position": {"x": 200, "y": 200},
                "data": {
                    "label": "Public Subnet",
                    "properties": {"cidr_block": "10.0.1.0/24"},
                },
            },
        ],
        "edges": [
            {
                "id": "e1",
                "source": "vpc-1",
                "target": "subnet-1",
            },
        ],
    }


@pytest.fixture(scope="function")
def sample_terraform_config() -> str:
    """Sample Terraform configuration for testing."""
    return '''
provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "Main VPC"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"

  tags = {
    Name = "Public Subnet"
  }
}
'''
