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
    """Verify topics API returns paginated list of social discussions."""
    response = client.get("/api/v1/forum/topics")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert data["total"] >= 5
    assert len(data["items"]) >= 5

    first = data["items"][0]
    assert "id" in first
    assert "title" in first
    assert "snippet" in first
    assert "author_name" in first
    assert "author_role_badge" in first
    assert "upvotes_count" in first
    assert "post_type" in first
    assert "created_at" in first


def test_filter_topics_by_category() -> None:
    """Verify filtering topics by category slug."""
    response = client.get("/api/v1/forum/topics?category_slug=infosec-audit")
    assert response.status_code == 200
    data = response.json()
    assert data["category_slug"] == "infosec-audit"
    for item in data["items"]:
        assert item["category_slug"] == "infosec-audit"


def test_filter_topics_by_post_type() -> None:
    """Verify filtering topics by post type tab (e.g. bug, cbr, code, job)."""
    response = client.get("/api/v1/forum/topics?post_type=bug")
    assert response.status_code == 200
    data = response.json()
    assert data["post_type"] == "bug"
    for item in data["items"]:
        assert item["post_type"] == "bug"


def test_filter_topics_by_tag() -> None:
    """Verify filtering topics by tag."""
    response = client.get("/api/v1/forum/topics?tag=Solidity")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert any(t.lower() == "solidity" for t in item["tags"])


def test_create_topic_success() -> None:
    """Verify successful creation of a new post via POST API."""
    payload = {
        "title": "Тестирование интеграции оракула курсов валют в смарт-контракт",
        "category_slug": "oracles",
        "post_type": "data",
        "body": (
            "Предлагаем обсудить реализацию отказоустойчивого оракула котировок USD/RUB "
            "для автоматического исполнения конверсионных сделок в контуре ПКСК Банка России."
        ),
        "code_snippet": "// Oracle verification code\nfunction getPrice() external returns (uint256);",
        "code_language": "solidity",
        "tags": ["Оракулы", "КурсыВалют", "ПКСК"],
        "author_name": "ООО ФинтехИнтегратор",
        "author_role": "Разработчик",
    }
    response = client.post("/api/v1/forum/posts", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "Тема успешно создана"
    assert "topic" in data

    topic = data["topic"]
    assert topic["title"] == payload["title"]
    assert topic["category_slug"] == "oracles"
    assert topic["post_type"] == "data"
    assert topic["code_snippet"] is not None
    assert topic["author_avatar"] == "ОФ"


def test_post_upvote_toggle() -> None:
    """Verify upvote toggle action on a post."""
    # First get a post id
    posts_resp = client.get("/api/v1/forum/posts")
    post_id = posts_resp.json()["items"][0]["id"]
    initial_upvotes = posts_resp.json()["items"][0]["upvotes_count"]

    # Toggle upvote
    upvote_resp = client.post(f"/api/v1/forum/posts/{post_id}/upvote")
    assert upvote_resp.status_code == 200
    upvote_data = upvote_resp.json()
    assert upvote_data["post_id"] == post_id
    assert "upvotes_count" in upvote_data
    assert "is_upvoted" in upvote_data


def test_post_bookmark_toggle() -> None:
    """Verify bookmark toggle action on a post."""
    posts_resp = client.get("/api/v1/forum/posts")
    post_id = posts_resp.json()["items"][0]["id"]

    bm_resp = client.post(f"/api/v1/forum/posts/{post_id}/bookmark")
    assert bm_resp.status_code == 200
    bm_data = bm_resp.json()
    assert bm_data["post_id"] == post_id
    assert "is_bookmarked" in bm_data


def test_add_post_comment() -> None:
    """Verify adding a comment under a post."""
    posts_resp = client.get("/api/v1/forum/posts")
    post_id = posts_resp.json()["items"][0]["id"]

    comment_payload = {
        "body": "Превосходный анализ архитектуры, внедрили в наш тестовый стенд.",
        "author_name": "ООО СмартКонсалтинг",
        "author_role": "Разработчик",
    }
    comment_resp = client.post(
        f"/api/v1/forum/posts/{post_id}/comments", json=comment_payload
    )
    assert comment_resp.status_code == 201
    data = comment_resp.json()
    assert "comment" in data
    assert data["comment"]["body"] == comment_payload["body"]
    assert data["comment"]["author_avatar"] == "ОС"
    assert data["comments_count"] >= 1


def test_create_topic_xss_sanitization() -> None:
    """Verify XSS injection attempts in post title and body are escaped."""
    xss_payload = {
        "title": "<script>alert('XSS')</script> Взлом заголовка темы",
        "category_slug": "infosec-audit",
        "post_type": "bug",
        "body": (
            "<iframe src='javascript:alert(1)'></iframe> "
            "Текст с попыткой внедрения вредоносного фрейма и скрипта для проверки безопасности."
        ),
        "tags": ["<script>", "XSS_Test", "Security"],
        "author_name": "<b>Hacker</b>",
        "author_role": "Разработчик",
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


def test_render_social_feed_html_page() -> None:
    """Verify GET /feed renders full SSR HTML page with all Social Hub components."""
    response = client.get("/feed")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")

    html = response.text
    # 1.1 Quick Publisher Bar
    assert "Поделитесь новостью, багом, идеей или задайте вопрос по ПКСК" in html
    assert "Новость / Статья" in html
    assert "Баг / Сложность" in html
    assert "Заказ / Задача" in html
    assert "Идея / Сценарий" in html

    # 1.2 Filters and Tag Chips
    assert "Вся лента" in html
    assert "ПКСК &amp; ЦБ" in html or "ПКСК & ЦБ" in html
    assert "Баги &amp; Ошибки" in html or "Баги & Ошибки" in html
    assert "Стек &amp; Код" in html or "Стек & Код" in html
    assert "#Solidity" in html
    assert "#Standoff365" in html
    assert "#ФНС_API" in html

    # 1.3 Post Cards & Badges
    assert "CVE-2026-ПКСК-04" in html
    assert "ИБ-Аудитор" in html
    assert "Официально ЦБ" in html
    assert "ГИС «Зерно»" in html
    assert "Цифрового Рубля" in html

    # 1.4 Right Sidebar Widgets
    assert "Тренды &amp; Теги ПКСК" in html or "Тренды & Теги ПКСК" in html
    assert "Топ авторов недели" in html
    assert "Календарь НИР ЦБ РФ" in html
    assert "30.09.2026" in html
    assert "31.03.2027" in html

    # 1.5 Modal
    assert "socialPublisherModal" in html
    assert "Создать публикацию в соцсети" in html