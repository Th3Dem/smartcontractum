"""QA & Reliability Test Suite for Block 6: Profile & Umbrella Workspace."""

import sys
from pathlib import Path
from starlette.testclient import TestClient

project_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.app import app  # noqa: E402

client = TestClient(app)


def test_render_profile_page() -> None:
    """Verify GET /profile renders full specialist profile & umbrella dashboard."""
    resp = client.get("/profile")
    assert resp.status_code == 200
    assert "text/html" in resp.headers.get("content-type", "")

    html = resp.text
    assert "Александр Волков" in html
    assert "Аккредитованный автор SmartContractum" in html
    assert "Umbrella-Контракты" in html
    assert "Роялти &amp; Финансы" in html or "Роялти & Финансы" in html
    assert "Мои Паспорта" in html
    assert "umbrellaModalOverlay" in html


def test_get_profile_me_api() -> None:
    """Verify GET /api/v1/profile/me returns current specialist metadata."""
    resp = client.get("/api/v1/profile/me")
    assert resp.status_code == 200
    data = resp.json()

    assert data["full_name"] == "Александр Волков"
    assert data["is_umbrella_approved"] is True
    assert data["reputation_score"] > 900
    assert len(data["skills"]) > 0


def test_get_umbrella_earnings_api() -> None:
    """Verify GET /api/v1/profile/umbrella/earnings returns financial metrics."""
    resp = client.get("/api/v1/profile/umbrella/earnings")
    assert resp.status_code == 200
    data = resp.json()

    assert data["total_executions"] > 0
    assert data["total_earnings_rub"] > 0
    assert data["available_payout_rub"] > 0
    assert len(data["ledger"]) > 0


def test_submit_umbrella_contract_success() -> None:
    """Verify POST /api/v1/profile/umbrella/submit processes valid contract proposal."""
    payload = {
        "title": "Автоматический эскроу лизинга спецтехники",
        "version": "v1.0.0",
        "passport_code": "SC-2026-PKSC-LEASING-01",
        "royalty_percent": 2.5,
        "agreed_terms": True,
    }
    resp = client.post("/api/v1/profile/umbrella/submit", json=payload)
    assert resp.status_code == 201
    data = resp.json()

    assert data["status"] == "success"
    assert "contract_id" in data
    assert data["tracking_code"].startswith("UMB-PKSC-")


def test_submit_umbrella_contract_invalid_royalty_bounds() -> None:
    """Verify 422 Unprocessable Entity when royalty percent is out of bounds (0.1% to 50.0%)."""
    # Over 50.0%
    payload_high = {
        "title": "Контракт со сверх-комиссией",
        "passport_code": "SC-2026-PKSC-HIGH",
        "royalty_percent": 75.0,
        "agreed_terms": True,
    }
    resp_high = client.post(
        "/api/v1/profile/umbrella/submit", json=payload_high
    )
    assert resp_high.status_code == 422

    # Under 0.1%
    payload_low = {
        "title": "Контракт с нулевой комиссией",
        "passport_code": "SC-2026-PKSC-LOW",
        "royalty_percent": 0.0,
        "agreed_terms": True,
    }
    resp_low = client.post("/api/v1/profile/umbrella/submit", json=payload_low)
    assert resp_low.status_code == 422


def test_submit_umbrella_contract_missing_agreement() -> None:
    """Verify 422 Unprocessable Entity when user does not agree with license terms."""
    payload = {
        "title": "Контракт без согласия",
        "passport_code": "SC-2026-PKSC-NO-AGREE",
        "royalty_percent": 2.0,
        "agreed_terms": False,
    }
    resp = client.post("/api/v1/profile/umbrella/submit", json=payload)
    assert resp.status_code == 422
