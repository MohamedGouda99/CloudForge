import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

# Use a lightweight SQLite database for tests to avoid depending on Postgres.
TEST_DB_PATH = Path(__file__).parent / "test.db"
os.environ.setdefault("DATABASE_URL", f"sqlite:///{TEST_DB_PATH}")

from app.main import app  # noqa: E402  (import after env configuration)

client = TestClient(app)


def teardown_module(module):
    """Cleanup temporary SQLite database after tests."""
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


@pytest.mark.parametrize("route", ["/", "/health"])
def test_get_routes_return_json(route):
    response = client.get(route)
    assert response.headers["content-type"] == "application/json"
