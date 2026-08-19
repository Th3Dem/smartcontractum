"""Forum and Professional Social Network API Router for SmartContractum."""

from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Query, Request, Response, status
from fastapi.templating import Jinja2Templates

from backend.models.forum import (
    Category,
    CategoryListResponse,
    Topic,
    TopicCreateRequest,
    TopicListResponse,
    TopicResponse,
    generate_snippet,
)

router = APIRouter(prefix="", tags=["Lenta & Forum"])

# Resolve templates path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
TEMPLATES_DIR = PROJECT_ROOT / "frontend" / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

# In-Memory Seed Storage for High-Speed Concurrent Demonstration
CATEGORIES_DB: List[Category] = [
    Category(id=1, name="Все обсуждения", slug="all", icon="💬", count_topics=4),
    Category(
        id=2, name="Безопасные сделки", slug="safe-deals", icon="🔒", count_topics=1
    ),
    Category(
        id=3, name="Казначейство & B2B", slug="treasury-b2b", icon="🏦", count_topics=1
    ),
    Category(
        id=4,
        name="Источники данных (Оракулы)",
        slug="oracles",
        icon="🌐",
        count_topics=1,
    ),
    Category(
        id=5,
        name="ИБ, Аудит & Bug Bounty",
        slug="infosec-audit",
        icon="🛡️",
        count_topics=1,
    ),
    Category(
        id=6, name="АПК & Субсидии", slug="agro-subsidies", icon="🌾", count_topics=0
    ),
]

TOPICS_DB: List[Topic] = [
    Topic(
        id=1,
        title="Официальное обсуждение Концепции ПКСК Банка России (2026): ключевые развилки для разработчиков",
        snippet=(
            "Банк России представил Концепцию Платформы Конструктор Смарт-Контрактов (ПКСК). "
            "Обсуждаем архитектуру Umbrella-интегратора, требования к независимым разработчикам "
            "и стандарты сертификации."
        ),
        body=(
            "18 июня 2026 года Банк России опубликовал Концепцию ПКСК. "
            "Ключевой вызов для рынка — обеспечение доступа независимых разработчиков и финтех-компаний "
            "в защищенный контур. Платформа SmartContractum выступает Umbrella-шлюзом, позволяющим "
            "проектировать контракты в виде визуальных деревьев решений до 31.03.2027 в рамках фазы НИР."
        ),
        author_name="Ассоциация ФинТех / Экспертная группа",
        author_role="Регуляторный комплаенс",
        author_avatar="АФ",
        is_official=True,
        official_badge="Официальное обсуждение НИР",
        category_id=2,
        category_slug="safe-deals",
        views_count=428,
        replies_count=34,
        tags=["ПКСК_2026", "КонцепцияЦБ", "НИР", "СмартКонтракты"],
        created_at="19.08.2026, 14:30",
    ),
    Topic(
        id=2,
        title="SLA и юридическая ответственность оракулов при исполнении эскроу-сделок в контуре ПКСК",
        snippet=(
            "Как гарантировать достоверность котировок и данных логистики? "
            "Разбираем требования к мульти-подписям, арбитражу при недоступности внешних API "
            "и страхованию рисков оракулов."
        ),
        body=(
            "В сделках с депонированием средств оракул является единой точкой отказа. "
            "В SmartContractum предложена схема кворума оракулов (2 из 3) с криптографическим подтверждением "
            "ГОСТ Р 34.12-2015. Приглашаем разработчиков оракулов к открытому аудиту спецификации."
        ),
        author_name="Лаборатория Оракулов (OracleLab)",
        author_role="Провайдер данных",
        author_avatar="OL",
        is_official=True,
        official_badge="Вопрос к ЦБ",
        category_id=4,
        category_slug="oracles",
        views_count=312,
        replies_count=19,
        tags=["Оракулы", "Ответственность", "Эскроу", "SLA"],
        created_at="19.08.2026, 16:15",
    ),
    Topic(
        id=3,
        title="Архитектура казначейского сплит-платежа для B2B цепочек поставок с подтверждением через ЭДО",
        snippet=(
            "Кейс автоматического распределения выручки между генеральным подрядчиком, субподрядчиками "
            "и налоговым агентом в момент подписания универсального передаточного документа (УПД)."
        ),
        body=(
            "Практическая реализация казначейского смарт-контракта на базе дерева решений. "
            "Событие УПД из Диадок/СБИС триггерит мгновенный казначейский сплит средств "
            "без задержек банковского дня и кассовых разрывов."
        ),
        author_name="ПАО ПромИнтегратор",
        author_role="Enterprise Архитектор",
        author_avatar="ПИ",
        is_official=False,
        official_badge="Сценарий АБР",
        category_id=3,
        category_slug="treasury-b2b",
        views_count=256,
        replies_count=12,
        tags=["B2B", "Казначейство", "ЭДО", "СплитПлатежи"],
        created_at="19.08.2026, 18:45",
    ),
    Topic(
        id=4,
        title="Подготовка смарт-контрактов к пред-аудиту BI.ZONE и кибер-полигону Standoff 365",
        snippet=(
            "Чеклист статического и динамического анализа контрактов перед подачей в контур ПКСК: "
            "защита от reentrancy, переполнения и контроль прав доступа через ролевую модель RBAC."
        ),
        body=(
            "Отдел безопасности SmartContractum опубликовал методические рекомендации по самодиагностике. "
            "Используем Bandit, Trivy и формальную верификацию условий для исключения критических уязвимостей "
            "до официального релиза в реестре Банка России."
        ),
        author_name="SmartContractum Security Team",
        author_role="AppSec Lead",
        author_avatar="SC",
        is_official=True,
        official_badge="ИБ & Аудит",
        category_id=5,
        category_slug="infosec-audit",
        views_count=514,
        replies_count=28,
        tags=["ИБ", "BIZONE", "Standoff365", "BugBounty"],
        created_at="19.08.2026, 20:00",
    ),
]


def _recalculate_category_counts() -> None:
    """Recalculate topic count per category."""
    counts: Dict[str, int] = {}
    for topic in TOPICS_DB:
        counts[topic.category_slug] = counts.get(topic.category_slug, 0) + 1

    total_all = len(TOPICS_DB)
    for cat in CATEGORIES_DB:
        if cat.slug == "all":
            cat.count_topics = total_all
        else:
            cat.count_topics = counts.get(cat.slug, 0)


# ======================================================================
# REST API ENDPOINTS
# ======================================================================


@router.get(
    "/api/v1/forum/categories",
    response_model=CategoryListResponse,
    summary="Get all forum categories with topic counts",
)
async def get_forum_categories() -> CategoryListResponse:
    """Return list of categories with live updated topic counters."""
    _recalculate_category_counts()
    return CategoryListResponse(total=len(CATEGORIES_DB), items=CATEGORIES_DB)


@router.get(
    "/api/v1/forum/topics",
    response_model=TopicListResponse,
    summary="Get paginated list of topics with optional category and tag filtering",
)
async def get_forum_topics(
    category_slug: Optional[str] = Query(
        None,
        description="Filter by category slug (e.g. 'safe-deals', 'oracles', 'all')",
    ),
    tag: Optional[str] = Query(
        None,
        description="Filter by tag (e.g. 'ПКСК_2026', 'Оракулы')",
    ),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
) -> TopicListResponse:
    """Retrieve filtered topics ordered by newest first."""
    filtered = list(TOPICS_DB)

    if category_slug and category_slug != "all":
        filtered = [t for t in filtered if t.category_slug == category_slug]

    if tag:
        tag_clean = tag.strip().lstrip("#").lower()
        filtered = [
            t for t in filtered if any(t_tag.lower() == tag_clean for t_tag in t.tags)
        ]

    # Order newest first (descending by id)
    filtered.sort(key=lambda t: t.id, reverse=True)

    start = (page - 1) * limit
    end = start + limit
    paginated_items = filtered[start:end]

    return TopicListResponse(
        total=len(filtered),
        page=page,
        limit=limit,
        category_slug=category_slug,
        tag=tag,
        items=paginated_items,
    )


@router.post(
    "/api/v1/forum/topics",
    response_model=TopicResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new discussion topic with automatic sanitization",
)
async def create_forum_topic(payload: TopicCreateRequest) -> TopicResponse:
    """Create and validate a new forum topic with XSS-safe processing."""
    _recalculate_category_counts()

    # Find matching category
    target_cat = next(
        (
            c
            for c in CATEGORIES_DB
            if c.slug == payload.category_slug and c.slug != "all"
        ),
        None,
    )
    if not target_cat:
        # Fallback to safe-deals if category not found or is 'all'
        target_cat = CATEGORIES_DB[1]  # safe-deals

    new_id = max((t.id for t in TOPICS_DB), default=0) + 1
    snippet = generate_snippet(payload.body, max_chars=200)
    created_now = datetime.now().strftime("%d.%m.%Y, %H:%M")

    # Determine author avatar initials
    avatar_initials = (
        "".join([w[0] for w in payload.author_name.split()[:2]]).upper() or "SC"
    )

    new_topic = Topic(
        id=new_id,
        title=payload.title,
        snippet=snippet,
        body=payload.body,
        author_name=payload.author_name,
        author_role=payload.author_role,
        author_avatar=avatar_initials,
        is_official=False,
        official_badge=None,
        category_id=target_cat.id,
        category_slug=target_cat.slug,
        views_count=1,
        replies_count=0,
        tags=payload.tags or ["ПКСК", target_cat.name.split()[0]],
        created_at=created_now,
    )

    TOPICS_DB.insert(0, new_topic)
    _recalculate_category_counts()

    return TopicResponse(topic=new_topic, message="Тема успешно создана")


# ======================================================================
# SSR FORUM PAGE ROUTE
# ======================================================================


@router.get("/feed", summary="Feed & Forum HTML Page")
async def render_forum_page(
    request: Request,
    category: Optional[str] = Query(None, description="Active category slug"),
    tag: Optional[str] = Query(None, description="Active tag filter"),
) -> Response:
    """Render full 3-column Forum & Discussions HTML page."""
    _recalculate_category_counts()
    active_cat = category or "all"

    # Filter topics for initial SSR
    filtered_topics = list(TOPICS_DB)
    if active_cat != "all":
        filtered_topics = [t for t in filtered_topics if t.category_slug == active_cat]

    if tag:
        tag_clean = tag.strip().lstrip("#").lower()
        filtered_topics = [
            t
            for t in filtered_topics
            if any(t_tag.lower() == tag_clean for t_tag in t.tags)
        ]

    filtered_topics.sort(key=lambda t: t.id, reverse=True)

    # Extract top popular tags
    all_tags: Dict[str, int] = {}
    for topic in TOPICS_DB:
        for t in topic.tags:
            all_tags[t] = all_tags.get(t, 0) + 1
    popular_tags = sorted(all_tags.items(), key=lambda x: x[1], reverse=True)[:8]

    context: dict[str, Any] = {
        "active_nav": "feed",
        "categories": CATEGORIES_DB,
        "topics": filtered_topics,
        "active_category": active_cat,
        "active_tag": tag,
        "popular_tags": popular_tags,
        "user_org": "ООО Интегратор (Umbrella-Dev)",
        "nir_phase": "Фаза НИР ЦБ РФ (до 31.03.2027)",
    }
    return templates.TemplateResponse(
        request=request,
        name="forum/index.html",
        context=context,
    )
