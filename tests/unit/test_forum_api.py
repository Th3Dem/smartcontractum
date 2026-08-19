import sys
from pathlib import Path
from starlette.testclient import TestClient

project_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.app import app  # noqa: E402

client = TestClient(app)


def test_get_forum_categories_returns_200_and_list() -> None:
    """Verify categories API endpoint returns list of all market categories."""
    response = client.get("/api/v1/forum/categories")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert data["total"] >= 6
    assert "items" in data

    slugs = [c["slug"] for c in data["items"]]
    assert "all" in slugs
    assert "safe-deals" in slugs
    assert "treasury-b2b" in slugs
    assert "oracles" in slugs
    assert "infosec-audit" in slugs
    assert "agro-subsidies" in slugs


def test_get_forum_topics_default_returns_all() -> None:
    """Verify topics API returns paginated list of discussions."""
    response = client.get("/api/v1/forum/topics")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert data["total"] >= 4
    assert len(data["items"]) >= 4

    first = data["items"][0]
    assert "id" in first
    assert "title" in first
    assert "snippet" in first
    assert "author_name" in first
    assert "created_at" in first


def test_filter_topics_by_category() -> None:
    """Verify filtering topics by category slug."""
    response = client.get("/api/v1/forum/topics?category_slug=safe-deals")
    assert response.status_code == 200
    data = response.json()
    assert data["category_slug"] == "safe-deals"
    for item in data["items"]:
        assert item["category_slug"] == "safe-deals"


def test_filter_topics_by_nonexistent_category_returns_empty_list() -> None:
    """Verify non-existent category returns 200 OK with empty items list (no 500 error)."""
    response = client.get("/api/v1/forum/topics?category_slug=nonexistent-cat-999")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["items"] == []


def test_filter_topics_by_tag() -> None:
    """Verify filtering topics by tag."""
    response = client.get("/api/v1/forum/topics?tag=Оракулы")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert any(t.lower() == "оракулы" for t in item["tags"])


def test_create_topic_success() -> None:
    """Verify successful creation of a new topic via POST API."""
    payload = {
        "title": "Тестирование интеграции оракула курсов валют в смарт-контракт",
        "category_slug": "oracles",
        "body": (
            "Предлагаем обсудить реализацию отказоустойчивого оракула котировок USD/RUB "
            "для автоматического исполнения конверсионных сделок в контуре ПКСК Банка России."
        ),
        "tags": ["Оракулы", "КурсыВалют", "ПКСК"],
        "author_name": "ООО ФинтехИнтегратор",
        "author_role": "Интегратор",
    }
    response = client.post("/api/v1/forum/topics", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "Тема успешно создана"
    assert "topic" in data

    topic = data["topic"]
    assert topic["title"] == payload["title"]
    assert topic["category_slug"] == "oracles"
    assert "USD/RUB" in topic["snippet"]
    assert topic["author_avatar"] == "ОФ"


def test_create_topic_xss_sanitization() -> None:
    """Verify XSS injection attempts in topic title and body are escaped."""
    xss_payload = {
        "title": "<script>alert('XSS')</script> Взлом заголовка темы",
        "category_slug": "infosec-audit",
        "body": (
            "<iframe src='javascript:alert(1)'></iframe> "
            "Текст с попыткой внедрения вредоносного фрейма и скрипта для проверки безопасности."
        ),
        "tags": ["<script>", "XSS_Test", "Security"],
        "author_name": "<b>Hacker</b>",
        "author_role": "Tester",
    }
    response = client.post("/api/v1/forum/topics", json=xss_payload)
    assert response.status_code == 201
    topic = response.json()["topic"]

    # Verify raw script/iframe tags are NOT present
    assert "<script>" not in topic["title"]
    assert "<iframe" not in topic["body"]
    assert "&lt;script&gt;" in topic["title"] or "alert" in topic["title"]
    assert "&lt;iframe" in topic["body"]


def test_create_topic_validation_errors() -> None:
    """Verify 422 Unprocessable Entity on short title or short body."""
    # Short title
    resp1 = client.post(
        "/api/v1/forum/topics",
        json={
            "title": "Short",
            "category_slug": "safe-deals",
            "body": "Длинный текст сообщения для прохождения валидации тела топика...",
        },
    )
    assert resp1.status_code == 422

    # Short body
    resp2 = client.post(
        "/api/v1/forum/topics",
        json={
            "title": "Корректный длинный заголовок темы",
            "category_slug": "safe-deals",
            "body": "Короткое тело",
        },
    )
    assert resp2.status_code == 422


def test_render_forum_feed_html_page() -> None:
    """Verify GET /feed renders full SSR HTML page with all 3 columns."""
    response = client.get("/feed")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")

    html = response.text
    # 2.1 Left Sidebar
    assert "Категории рынка" in html
    assert "Безопасные сделки" in html
    assert "Казначейство &amp; B2B" in html or "Казначейство & B2B" in html

    # 2.2 Central Feed
    assert "Лента обсуждений" in html
    assert "Создать тему" in html
    assert "Официальное обсуждение Концепции ПКСК Банка России" in html

    # 2.3 Right Sidebar
    assert "Статус &amp; Таймлайн ПКСК" in html or "Статус & Таймлайн ПКСК" in html
    assert "18.06.2026" in html
    assert "30.09.2026" in html
    assert "31.03.2027" in html
    assert "Популярные теги" in html

    # 2.4 Modal
    assert "createTopicModal" in html
    assert "Создать новое обсуждение" in html
