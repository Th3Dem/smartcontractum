"""QA & Reliability Test Suite for Block 3: Passport Wizard & Decision Tree."""

import sys
from pathlib import Path
from starlette.testclient import TestClient

project_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.app import app  # noqa: E402

client = TestClient(app)


def test_render_passport_wizard_page() -> None:
    """Verify GET /passport renders full Wizard HTML page extending base shell."""
    response = client.get("/passport")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")

    html = response.text
    assert "Генератор Паспорта" in html
    assert "Мастер параметров сценария" in html
    assert "Дерево решений ПКСК" in html
    assert "passportWizardForm" in html
    assert "btnDownloadMarkdown" in html


def test_generate_passport_endpoint_success() -> None:
    """Verify POST /api/v1/passport/generate returns structured decision tree and markdown."""
    payload = {
        "title": "Автоматизированная оплата логистической доставки",
        "parties": "ООО РитейлСеть (Заказчик), АО ЛогистикТранс (Перевозчик), ПАО ФинБанк",
        "trigger_event": "Фиксация геолокации и подписание электронной транспортной накладной (ЭТрН)",
        "exception_flow": "Повреждение пломбы или задержка прибытия груза более 48 часов",
        "data_source_type": "Коммерческая ИС / ЭДО (Диадок, СБИС)",
        "success_action": "Мгновенный перевод 100% суммы фрахта на счет Перевозчика",
    }
    response = client.post("/api/v1/passport/generate", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert "id" in data
    assert "passport_code" in data
    assert data["passport_code"].startswith("SC-2026-PKSC-")
    assert "decision_tree_text" in data
    assert "full_passport_markdown" in data

    tree = data["decision_tree_text"]
    assert "[СТРУКТУРА ДЕРЕВА РЕШЕНИЙ ДЛЯ ПУБЛИКАЦИИ]" in tree
    assert f"├─ НАЗВАНИЕ: {payload['title']}" in tree
    assert "IF (Событие:" in tree
    assert "THEN" in tree
    assert "ELSE IF" in tree


def test_generate_passport_xss_sanitization() -> None:
    """Verify HTML/script tags in input are safely escaped in decision tree output."""
    payload = {
        "title": "<script>alert('XSS')</script> Поставка зерна",
        "parties": "<b>Покупатель</b>, <i>Поставщик</i>",
        "trigger_event": "<img src=x onerror=alert(1)> Подписание акта",
        "exception_flow": "<iframe src='evil.com'></iframe> Спор",
        "data_source_type": "ГИС",
        "success_action": "<script>steal()</script> Оплата",
    }
    response = client.post("/api/v1/passport/generate", json=payload)
    assert response.status_code == 201
    data = response.json()

    tree = data["decision_tree_text"]
    assert "<script>" not in tree
    assert "<iframe>" not in tree
    assert "<img" not in tree
    assert "&lt;script&gt;" in tree or "Поставка зерна" in tree


def test_generate_passport_validation_error_on_short_input() -> None:
    """Verify 422 Unprocessable Entity when mandatory fields are too short."""
    payload = {
        "title": "AB",  # < 5 chars
        "parties": "Покупатель, Поставщик",
        "trigger_event": "Подписание акта",
        "exception_flow": "Спор",
    }
    response = client.post("/api/v1/passport/generate", json=payload)
    assert response.status_code == 422
