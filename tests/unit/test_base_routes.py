import sys
from pathlib import Path
from starlette.testclient import TestClient

project_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.app import app  # noqa: E402

client = TestClient(app)


def test_index_endpoint_returns_200_and_html() -> None:
    """Verify that root endpoint renders index.html extending base.html."""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")

    html = response.text
    # Verify semantic HTML5 tags
    assert "<header" in html
    assert "<nav" in html
    assert "<main" in html
    assert "<footer" in html

    # Verify core branding & metadata
    assert "SmartContractum" in html
    assert "Личный Кабинет" in html
    assert "Фаза НИР ЦБ РФ (до 31.03.2027)" in html
    assert "ПКСК Банка России" in html


def test_navigation_subpages_return_200() -> None:
    """Verify all top-level navigation routes render successfully."""
    endpoints = ["/feed", "/passport", "/builder", "/sources"]
    for path in endpoints:
        resp = client.get(path)
        assert resp.status_code == 200
        assert "<header" in resp.text
        assert "<footer" in resp.text


def test_static_assets_availability() -> None:
    """Verify CSS and JavaScript static assets are served properly."""
    css_resp = client.get("/static/css/main.css")
    assert css_resp.status_code == 200
    assert "--bg-primary: #0f172a;" in css_resp.text

    js_resp = client.get("/static/js/main.js")
    assert js_resp.status_code == 200
    assert "SmartContractum" in js_resp.text


def test_security_headers_injected() -> None:
    """Verify security middleware sets required AppSec headers."""
    response = client.get("/")
    assert response.headers.get("x-content-type-options") == "nosniff"
    assert response.headers.get("x-frame-options") == "DENY"
    assert response.headers.get("x-xss-protection") == "1; mode=block"
