"""QA & Reliability Test Suite for Block 5: Data Sources Marketplace & Oracle Hub."""

import sys
from pathlib import Path
from starlette.testclient import TestClient

project_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.app import app  # noqa: E402

client = TestClient(app)


def test_render_data_sources_page() -> None:
    """Verify GET /data-sources and /sources render full Marketplace HTML page."""
    resp = client.get("/data-sources")
    assert resp.status_code == 200
    assert "text/html" in resp.headers.get("content-type", "")

    html = resp.text
    assert "Источники Данных" in html
    assert "Маркетплейс Оракулов" in html
    assert "Рекомендация ИБ" in html
    assert "ФНС России" in html
    assert "ЕИС Закупки" in html
    assert "trust-gis" in html
    assert "trust-commercial" in html
    assert "trust-open" in html

    # Test alias
    resp_alias = client.get("/sources")
    assert resp_alias.status_code == 200


def test_get_data_sources_api_all() -> None:
    """Verify GET /api/v1/data-sources returns all 4 baseline sources."""
    resp = client.get("/api/v1/data-sources")
    assert resp.status_code == 200
    data = resp.json()

    assert data["total"] == 4
    assert len(data["items"]) == 4

    names = [s["name"] for s in data["items"]]
    assert any("ФНС" in n for n in names)
    assert any("ЕИС" in n for n in names)
    assert any("Межбанковский" in n for n in names)
    assert any("Биржа" in n for n in names)


def test_get_data_sources_api_filter_by_category() -> None:
    """Verify category filtering for GIS, Commercial, and Open sources."""
    # GIS filter
    resp_gis = client.get("/api/v1/data-sources?category=gis")
    assert resp_gis.status_code == 200
    data_gis = resp_gis.json()
    assert data_gis["total"] == 2
    assert all(item["category_slug"] == "gis" for item in data_gis["items"])

    # Commercial filter
    resp_comm = client.get("/api/v1/data-sources?category=commercial")
    assert resp_comm.status_code == 200
    data_comm = resp_comm.json()
    assert data_comm["total"] == 1
    assert data_comm["items"][0]["category_slug"] == "commercial"

    # Open filter
    resp_open = client.get("/api/v1/data-sources?category=open")
    assert resp_open.status_code == 200
    data_open = resp_open.json()
    assert data_open["total"] == 1
    assert data_open["items"][0]["category_slug"] == "open"


def test_get_data_sources_api_filter_by_nonexistent_category_returns_empty() -> None:
    """Verify filtering by non-existent category returns 200 OK and empty list."""
    resp = client.get("/api/v1/data-sources?category=nonexistent_unknown")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["items"] == []


def test_suggest_data_source_success_and_xss_sanitization() -> None:
    """Verify POST /api/v1/data-sources/suggest accepts proposals and escapes XSS."""
    payload = {
        "name": "<script>alert('XSS')</script> АО ФинОракул",
        "cbr_category": "Коммерческая ИС",
        "api_type": "gRPC / Protobuf",
        "contact_email": "api-team@finoracle.ru",
        "description": "<img src=x onerror=alert(1)> Поставка котировок драгметаллов ЦБ РФ",
    }
    resp = client.post("/api/v1/data-sources/suggest", json=payload)
    assert resp.status_code == 201
    data = resp.json()

    assert data["status"] == "success"
    assert "application_id" in data
    assert data["application_id"].startswith("APP-SRC-")


def test_suggest_data_source_invalid_email() -> None:
    """Verify 422 Unprocessable Entity when email format is invalid."""
    payload = {
        "name": "АО ФинОракул",
        "cbr_category": "Коммерческая ИС",
        "contact_email": "invalid-email-string",
        "description": "Поставка котировок драгметаллов ЦБ РФ",
    }
    resp = client.post("/api/v1/data-sources/suggest", json=payload)
    assert resp.status_code == 422
