"""QA & Reliability Test Suite for Block 1: Hero Section & 6-Action Task Router."""

import sys
from pathlib import Path
from starlette.testclient import TestClient

project_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.app import app  # noqa: E402

client = TestClient(app)


def test_home_page_returns_200_and_html() -> None:
    """Verify GET / renders homepage HTML extending base shell with Hero UTP."""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")

    html = response.text
    # 1.1 Hero Banner
    assert "ИДЕИ" in html
    assert "ЛЮДИ" in html
    assert "ДАННЫЕ" in html
    assert "РЕШЕНИЯ" in html
    assert "Здесь рождаются" in html
    assert "российские смарт-контракты" in html
    assert "Место, где бизнес-задачи встречаются" in html
    assert "Банка&nbsp;России" in html
    assert "ПКСК" in html
    assert "SmartContractum" in html


def test_home_page_contains_all_six_action_routes() -> None:
    """Verify all 6 core user scenario cards exist in compiled HTML."""
    response = client.get("/")
    assert response.status_code == 200
    html = response.text

    # Card 1: У меня есть бизнес-задача -> Паспорт
    assert 'href="/passport"' in html
    assert "У меня есть бизнес-задача" in html
    assert "Поможем понять, нужен ли смарт-контракт" in html

    # Card 2: Ищу готовое решение -> Каталог решений
    assert 'href="/solutions"' in html
    assert "Ищу готовое решение" in html
    assert "Сценарии, типовые компоненты и готовые разработки" in html

    # Card 3: Ищу специалиста или услугу -> Модальный подбор
    assert "btnSpecialistModalTrigger" in html
    assert "Ищу специалиста или услугу" in html
    assert "Разработчики, эксперты, команды, аудиторы и интеграторы" in html

    # Card 4: Я специалист и хочу участвовать -> Кабинет специалиста
    assert 'href="/profile/join"' in html
    assert "Я специалист и хочу участвовать" in html
    assert "Проекты, рабочие группы, публикация разработок" in html

    # Card 5: Данные и оракулы -> Маркетплейс Оракулов
    assert 'href="/data-sources"' in html
    assert "Данные и оракулы" in html
    assert "Найти источник данных или предложить свои данные рынку" in html

    # Card 6: Хочу разобраться в ПКСК -> База знаний & Форум
    assert 'href="/knowledge"' in html
    assert "Хочу разобраться в ПКСК" in html
    assert "Знания, изменения, открытые вопросы и обучение" in html


def test_specialist_modal_and_role_chips() -> None:
    """Verify modal markup and 6 role sub-selection chips in HTML."""
    response = client.get("/")
    assert response.status_code == 200
    html = response.text

    assert "specialistModal" in html
    assert "Кого или что вы ищете?" in html
    assert "role=developer" in html
    assert "role=team" in html
    assert "role=audit" in html
    assert "role=expert" in html
    assert "role=integrator" in html
    assert "role=consultant" in html


def test_target_action_routes_return_200() -> None:
    """Verify all 6 action target endpoints return HTTP 200 OK."""
    # 1. Passport Generator
    resp1 = client.get("/passport")
    assert resp1.status_code == 200

    # 2. Ready Solutions
    resp2 = client.get("/solutions")
    assert resp2.status_code == 200

    # 3. Services Marketplace (default & role filters)
    resp3_all = client.get("/marketplace/services")
    assert resp3_all.status_code == 200

    resp3_role = client.get("/marketplace/services?role=developer")
    assert resp3_role.status_code == 200

    # 4. Specialist Onboarding / Join
    resp4 = client.get("/profile/join")
    assert resp4.status_code == 200

    # 5. Data Sources & Oracles
    resp5 = client.get("/data-sources")
    assert resp5.status_code == 200

    # 6. Knowledge Hub & Forum
    resp6 = client.get("/knowledge")
    assert resp6.status_code == 200


def test_schema_org_navigation_metadata() -> None:
    """Verify Schema.org SiteNavigationElement metadata in HTML."""
    response = client.get("/")
    assert response.status_code == 200
    html = response.text

    assert "SiteNavigationElement" in html
    assert "https://smartcontractum.ru/passport" in html
    assert "https://smartcontractum.ru/solutions" in html
    assert "https://smartcontractum.ru/marketplace/services" in html
    assert "https://smartcontractum.ru/profile/join" in html
    assert "https://smartcontractum.ru/data-sources" in html
    assert "https://smartcontractum.ru/knowledge" in html


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
