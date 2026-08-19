"""QA & Reliability Test Suite for Block 1: Hero Section & Task Router."""

import sys
from pathlib import Path
from starlette.testclient import TestClient

project_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.app import app  # noqa: E402

client = TestClient(app)


def test_home_page_returns_200_and_html() -> None:
    """Verify GET / renders homepage HTML extending base shell."""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")

    html = response.text
    # 1.1 Hero Banner
    assert "ИДЕИ · ЛЮДИ · ДАННЫЕ · РЕШЕНИЯ" in html
    assert "Здесь рождаются" in html
    assert "смарт-контракты" in html
    assert "Место, где бизнес-задачи встречаются" in html
    assert "ПКСК Банка России" in html
    assert "SmartContractum" in html


def test_home_page_contains_all_four_task_routes() -> None:
    """Verify all 4 core user scenario links exist in compiled HTML."""
    response = client.get("/")
    assert response.status_code == 200
    html = response.text

    # Route 1: Бизнес-задача -> Паспорт
    assert 'href="/passport"' in html
    assert "Есть бизнес-задача" in html
    assert "Сформировать Паспорт и «Дерево решений»" in html

    # Route 2: Собрать контракт -> Конструктор
    assert 'href="/builder"' in html
    assert "Собрать контракт" in html
    assert "Визуальный Low-code конструктор" in html

    # Route 3: Найти данные -> Маркетплейс Оракулов
    assert 'href="/data-sources"' in html
    assert "Найти данные" in html
    assert "Каталог ГИС, Банковских и Открытых API источников" in html

    # Route 4: Комьюнити -> Лента сообщества & Форум
    assert 'href="/feed"' in html or 'href="/forum"' in html
    assert "Комьюнити" in html
    assert "Форум" in html


def test_home_page_contains_ecosystem_stats_counters() -> None:
    """Verify ecosystem statistics panel is present in HTML."""
    response = client.get("/")
    assert response.status_code == 200
    html = response.text

    assert "Зарегистрированных экспертов" in html
    assert "Разработанных Паспортов" in html
    assert "Доверенных источников данных (ГИС/ИС)" in html
    assert "Проверенных сценариев" in html


def test_system_stats_api_endpoint() -> None:
    """Verify GET /api/v1/system/stats returns valid JSON metrics."""
    response = client.get("/api/v1/system/stats")
    assert response.status_code == 200
    data = response.json()

    # Verify keys
    assert "status" in data or "registered_experts" in data or "stats" in data
    if "stats" in data:
        stats = data["stats"]
        assert stats["experts_count"] > 0
        assert stats["passports_count"] > 0
        assert stats["data_sources_count"] > 0
        assert stats["verified_scenarios_count"] > 0
    else:
        assert (
            data.get("registered_experts", 0) > 0
            or data.get("experts_count", 0) > 0
        )


def test_route_aliases_availability() -> None:
    """Verify /data-sources and /forum aliases return 200 OK."""
    resp_sources = client.get("/data-sources")
    assert resp_sources.status_code == 200

    resp_forum = client.get("/forum")
    assert resp_forum.status_code == 200
