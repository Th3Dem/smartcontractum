"""Unit and API Integration Tests for SmartContractum Backend."""

import sys
from pathlib import Path
from starlette.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app import app  # noqa: E402

client = TestClient(app)


def test_health_check() -> None:
    """Verify health endpoint returns 200 OK and valid status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["platform"] == "SmartContractum v2.0"
    assert data["pksc_bridge"] == "active"
    assert data["circuit_breaker"] == "closed"
