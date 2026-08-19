"""QA & Reliability Test Suite for Block 4: Low-Code Builder & 5-Step Audit Simulator."""

import sys
from pathlib import Path
from starlette.testclient import TestClient

project_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.app import app  # noqa: E402
from backend.models.builder import BuilderNode  # noqa: E402

client = TestClient(app)


def test_render_builder_page() -> None:
    """Verify GET /builder renders full Builder Canvas & Audit Pipeline HTML."""
    response = client.get("/builder")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")

    html = response.text
    assert "Low-Code Конструктор" in html
    assert "1. Входной Триггер" in html
    assert "2. Проверка Оракула / ГИС" in html
    assert "3. Исполняющее Действие" in html
    assert "5-этапный пред-аудит ИБ" in html
    assert "btnStartAuditSimulation" in html


def test_simulate_audit_endpoint() -> None:
    """Verify POST /api/v1/builder/simulate-audit returns 200 OK and exactly 5 stages."""
    payload = {
        "contract_id": "SC-2026-TEST-009",
        "scenario_title": "Тестовая поставка зерна",
    }
    response = client.post("/api/v1/builder/simulate-audit", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["contract_id"] == "SC-2026-TEST-009"
    assert data["is_success"] is True
    assert "overall_score" in data
    assert "sha256_hash" in data
    assert len(data["sha256_hash"]) == 64  # SHA256 hex string

    steps = data["steps"]
    assert len(steps) == 5

    expected_steps = [
        "1. Описание логики",
        "2. Авто-проверка кода",
        "3. Экспертный ИБ-аудит",
        "4. Тестовая среда",
        "5. Публикация на Витрине",
    ]
    for idx, expected_name in enumerate(expected_steps, start=1):
        assert steps[idx - 1]["step_number"] == idx
        assert steps[idx - 1]["step_name"] == expected_name
        assert steps[idx - 1]["status"] == "completed"


def test_builder_node_xss_sanitization() -> None:
    """Verify XSS strings are escaped in BuilderNode model."""
    node = BuilderNode(
        id="xss-node",
        type="<script>alert(1)</script>",
        title="<img src=x onerror=alert(2)> Узел",
        description="<iframe src=evil.com></iframe> Описание",
    )
    assert "<script>" not in node.type
    assert "<img" not in node.title
    assert "<iframe" not in node.description
