import sys
from pathlib import Path
from starlette.testclient import TestClient

project_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.app import app  # noqa: E402

client = TestClient(app)


def test_get_forum_categories_returns_200_and_list() -> None:
    """Verify categories/hubs API endpoint returns list of all market hubs."""
    response = client.get("/api/v1/forum/categories")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert data["total"] >= 6
    assert "items" in data

    slugs = [c["slug"] for c in data["items"]]
    assert "all" in slugs
    assert "smart-contracts" in slugs
    assert "infosec-audit" in slugs
    assert "oracles" in slugs
    assert "treasury-b2b" in slugs
    assert "safe-deals" in slugs


def test_get_forum_topics_default_returns_all() -> None:
    """Verify topics API returns paginated list of Habr articles."""
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
    assert "score" in first
    assert "hubs" in first
    assert "created_at" in first


def test_filter_topics_by_category() -> None:
    """Verify filtering articles by category/hub slug."""
    response = client.get("/api/v1/forum/topics?category_slug=infosec-audit")
    assert response.status_code == 200
    data = response.json()
    assert data["category_slug"] == "infosec-audit"
    for item in data["items"]:
        assert item["category_slug"] == "infosec-audit"


def test_filter_topics_by_keyword_search() -> None:
    """Verify searching articles by keyword in title, body, or hubs."""
    response = client.get("/api/v1/forum/topics?q=Reentrancy")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        text_content = (
            item["title"] + " " + item["body"] + " " + " ".join(item["hubs"]) + " " + " ".join(item["tags"])
        ).lower()
        assert "reentrancy" in text_content


def test_filter_topics_by_sort() -> None:
    """Verify sorting articles by best, new, and discussed."""
    # Best (score)
    resp_best = client.get("/api/v1/forum/topics?sort=best")
    assert resp_best.status_code == 200
    items_best = resp_best.json()["items"]
    scores = [it["score"] for it in items_best]
    assert scores == sorted(scores, reverse=True)

    # New (id descending)
    resp_new = client.get("/api/v1/forum/topics?sort=new")
    assert resp_new.status_code == 200
    items_new = resp_new.json()["items"]
    ids = [it["id"] for it in items_new]
    assert ids == sorted(ids, reverse=True)


def test_filter_topics_by_tag() -> None:
    """Verify filtering articles by tag."""
    response = client.get("/api/v1/forum/topics?tag=Solidity")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert any(t.lower() == "solidity" for t in item["tags"])


def test_create_topic_success() -> None:
    """Verify successful creation of a new Habr article via POST API."""
    payload = {
        "title": "Тестирование интеграции оракула курсов валют в смарт-контракт",
        "category_slug": "oracles",
        "hubs": ["Оракулы & Данные*", "Solidity*"],
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
    assert topic["code_snippet"] is not None
    assert topic["score"] == 1


def test_post_upvote_toggle() -> None:
    """Verify score / rating toggle action on a post."""
    posts_resp = client.get("/api/v1/forum/posts")
    post_id = posts_resp.json()["items"][0]["id"]

    upvote_resp = client.post(f"/api/v1/forum/posts/{post_id}/upvote")
    assert upvote_resp.status_code == 200
    upvote_data = upvote_resp.json()
    assert upvote_data["post_id"] == post_id
    assert "score" in upvote_data
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
    assert "bookmarks_count" in bm_data


def test_add_post_comment() -> None:
    """Verify adding a comment under a Habr article."""
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
    assert data["comments_count"] >= 1


def test_create_topic_xss_sanitization() -> None:
    """Verify XSS injection attempts in article title and body are escaped."""
    xss_payload = {
        "title": "<script>alert('XSS')</script> Взлом заголовка статьи",
        "category_slug": "infosec-audit",
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

    assert "<script>" not in topic["title"]
    assert "<iframe" not in topic["body"]
    assert "&lt;script&gt;" in topic["title"] or "alert" in topic["title"]
    assert "&lt;iframe" in topic["body"]


def test_create_topic_validation_errors() -> None:
    """Verify 422 Unprocessable Entity on short title or short body."""
    resp1 = client.post(
        "/api/v1/forum/topics",
        json={
            "title": "Short",
            "category_slug": "safe-deals",
            "body": "Длинный текст сообщения для прохождения валидации тела топика...",
        },
    )
    assert resp1.status_code == 422


def test_render_habr_feed_html_page_with_search() -> None:
    """Verify GET /feed renders full SSR Habr Feed page with search bar."""
    response = client.get("/feed")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")

    html = response.text
    # 1. Search Bar with magnifying glass
    assert "habrSearchInput" in html
    assert "Поиск по статьям" in html
    assert "🔍" in html

    # 2. Streams Sub-Nav
    assert "Все потоки" in html
    assert "Разработка" in html
    assert "ИБ &amp; Аудит" in html or "ИБ & Аудит" in html

    # 3. Sorting Bar & Action
    assert "Лучшие" in html
    assert "Новые" in html
    assert "Обсуждаемые" in html
    assert "Написать статью" in html

    # 4. Search Filter Results test
    search_resp = client.get("/feed?q=Reentrancy")
    assert search_resp.status_code == 200
    search_html = search_resp.text
    assert "Результаты поиска по запросу" in search_html
    assert "Reentrancy" in search_html