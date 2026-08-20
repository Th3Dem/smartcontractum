from datetime import datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, Request, Response, status
from fastapi.templating import Jinja2Templates

from backend.models.forum import (
    BookmarkResponse,
    Category,
    CategoryListResponse,
    Comment,
    CommentCreateRequest,
    CommentResponse,
    Topic,
    TopicCreateRequest,
    TopicListResponse,
    TopicResponse,
    UpvoteResponse,
    generate_snippet,
)

router = APIRouter(tags=["Forum & Dev Social Network"])
templates = Jinja2Templates(directory="frontend/templates")

# ======================================================================
# IN-MEMORY CATEGORY & SOCIAL FEED DATABASE
# ======================================================================

CATEGORIES_DB: List[Category] = [
    Category(id=1, name="Все темы", slug="all", icon="🔥", count_topics=5),
    Category(id=2, name="Безопасные сделки", slug="safe-deals", icon="🔒", count_topics=1),
    Category(id=3, name="Казначейство & B2B", slug="treasury-b2b", icon="🏦", count_topics=1),
    Category(id=4, name="Источники данных (Оракулы)", slug="oracles", icon="🌐", count_topics=1),
    Category(id=5, name="ИБ, Аудит & Bug Bounty", slug="infosec-audit", icon="🛡️", count_topics=1),
    Category(id=6, name="АПК & Субсидии", slug="agro-subsidies", icon="🌾", count_topics=1),
]

ROLE_BADGES = {
    "Разработчик": ("[👨‍💻 Разработчик]", "role-dev"),
    "ИБ-Аудитор": ("[🛡️ ИБ-Аудитор]", "role-auditor"),
    "Поставщик данных": ("[📊 Поставщик данных]", "role-data"),
    "ЦБ/АБР Эксперт": ("[🏛️ ЦБ/АБР Эксперт]", "role-cbr"),
    "Заказчик": ("[💼 Заказчик]", "role-customer"),
    "Enterprise Архитектор": ("[🏛️ Архитектор]", "role-cbr"),
    "AppSec Lead": ("[🛡️ ИБ-Аудитор]", "role-auditor"),
    "Интегратор": ("[👨‍💻 Разработчик]", "role-dev"),
}

POST_TYPES = {
    "cbr": ("🟢 Официально ЦБ", "badge-type-cbr"),
    "bug": ("🔴 Баг / Ошибка", "badge-type-bug"),
    "code": ("💻 Стек & Код", "badge-type-code"),
    "data": ("📊 Оракулы & Данные", "badge-type-data"),
    "job": ("💼 Заказ / Проект", "badge-type-job"),
    "idea": ("💡 Идея / Сценарий", "badge-type-idea"),
    "article": ("📝 Новость / Статья", "badge-type-article"),
}

TOPICS_DB: List[Topic] = [
    # 1. Пост от ИБ-Аудитора
    Topic(
        id=1,
        title="[CVE-2026-ПКСК-04] Разбор уязвимости Reentrancy при вызове асинхронного коммерческого оракула",
        snippet="Анализ инцидента в тестовой сети: как небезопасный callback от оракула цен приводил к повторному входу в смарт-контракт эскроу до обновления баланса.",
        body=(
            "Команда BI.ZONE и SmartContractum Security выявила потенциальную проблему при использовании внешних оракулов с асинхронным ответом. "
            "Если смарт-контракт осуществляет выплату до фиксации внутреннего состояния isFulfilled = true, злоумышленник может вызвать повторный fulfill().\n\n"
            "Рекомендуем строго придерживаться паттерна Checks-Effects-Interactions (CEI) и подключать стандартный модификатор nonReentrant из открытого репозитория SmartContractum SDK."
        ),
        author_name="Алексей Смирнов",
        author_org="BI.ZONE Security Lab",
        author_role="ИБ-Аудитор",
        author_role_badge="[🛡️ ИБ-Аудитор]",
        author_role_class="role-auditor",
        author_avatar="АС",
        is_official=True,
        official_badge="ИБ & Bug Bounty",
        post_type="bug",
        post_type_label="🔴 Баг / Ошибка",
        post_type_class="badge-type-bug",
        category_id=5,
        category_slug="infosec-audit",
        reading_time="3 мин",
        views_count=642,
        upvotes_count=48,
        is_upvoted=False,
        is_bookmarked=False,
        replies_count=2,
        tags=["Solidity", "Standoff365", "BugBounty", "Reentrancy", "Оракулы"],
        code_snippet=(
            "// ❌ Уязвимый код:\n"
            "function fulfillOracleData(bytes32 requestId, uint256 price) external onlyOracle {\n"
            "    payable(beneficiary).transfer(escrowAmount);\n"
            "    requestFulfilled[requestId] = true; // Слишком поздно!\n"
            "}\n\n"
            "// ✅ Безопасный паттерн CEI:\n"
            "function fulfillOracleData(bytes32 requestId, uint256 price) external onlyOracle nonReentrant {\n"
            "    require(!requestFulfilled[requestId], 'Already fulfilled');\n"
            "    requestFulfilled[requestId] = true;\n"
            "    (bool ok, ) = payable(beneficiary).call{value: escrowAmount}('');\n"
            "    require(ok, 'Transfer failed');\n"
            "}"
        ),
        code_language="solidity",
        created_at="Сегодня в 18:20",
        comments=[
            Comment(
                id=101,
                post_id=1,
                author_name="Дмитрий Волков",
                author_role="Разработчик",
                author_avatar="ДВ",
                author_role_badge="[👨‍💻 Разработчик]",
                author_role_class="role-dev",
                body="Отличный разбор! Добавили проверку в CI-пайплайн Конструктора через Slither и Mythril.",
                created_at="Сегодня в 18:45",
                likes_count=12,
            ),
            Comment(
                id=102,
                post_id=1,
                author_name="SmartContractum Bot",
                author_role="AppSec Lead",
                author_avatar="SC",
                author_role_badge="[🛡️ ИБ-Аудитор]",
                author_role_class="role-auditor",
                body="Патч уже включен в базовые шаблоны реестра ПКСК v1.4.0.",
                created_at="Сегодня в 19:10",
                likes_count=8,
            ),
        ],
    ),
    # 2. Пост от Эксперта ЦБ/АБР
    Topic(
        id=2,
        title="Сбор обратной связи: Регламент третейского технического арбитража при сбоях поставщиков данных в ПКСК",
        snippet="Формируем порядок заморозки исполнения контрактов и подключения арбитров в спорных ситуациях до окончания активной фазы НИР 30.09.2026.",
        body=(
            "В рамках подготовки доклада Банка России Ассоциация ФинТех открывает публичную дискуссию. "
            "Вопрос: какой тайм-аут эскроу-заморозки является оптимальным при рассинхронизации показаний двух независимых оракулов (например, ФНС и таможенного шлюза)?\n\n"
            "Просим разработчиков и интеграторов поделиться реальными кейсами арбитража в комментариях."
        ),
        author_name="Елена Васильева",
        author_org="Комитет АБР & Консорциум",
        author_role="ЦБ/АБР Эксперт",
        author_role_badge="[🏛️ ЦБ/АБР Эксперт]",
        author_role_class="role-cbr",
        author_avatar="ЕВ",
        is_official=True,
        official_badge="Официально ЦБ",
        post_type="cbr",
        post_type_label="🟢 Официально ЦБ",
        post_type_class="badge-type-cbr",
        category_id=2,
        category_slug="safe-deals",
        reading_time="4 мин",
        views_count=1120,
        upvotes_count=84,
        is_upvoted=False,
        is_bookmarked=True,
        replies_count=2,
        tags=["Арбитраж", "ПКСК_2026", "ЦБ_РФ", "Регламент", "БезопасныеСделки"],
        code_snippet=None,
        code_language="solidity",
        created_at="Сегодня в 16:10",
        comments=[
            Comment(
                id=201,
                post_id=2,
                author_name="Михаил Орлов",
                author_role="Enterprise Архитектор",
                author_avatar="МО",
                author_role_badge="[🏛️ Архитектор]",
                author_role_class="role-cbr",
                body="Для B2B-сделок критичен тайм-аут не более 48 часов с возможностью предоставления оффлайн-первички через ЭДО.",
                created_at="Сегодня в 16:40",
                likes_count=19,
            ),
            Comment(
                id=202,
                post_id=2,
                author_name="ООО СтрахФин",
                author_role="Заказчик",
                author_avatar="СФ",
                author_role_badge="[💼 Заказчик]",
                author_role_class="role-customer",
                body="Поддерживаем 48 часов. Главное — исключить автоматическое списание до вердикта арбитражной ноды.",
                created_at="Сегодня в 17:15",
                likes_count=14,
            ),
        ],
    ),
    # 3. Пост от Поставщика данных
    Topic(
        id=3,
        title="Релиз REST API & WebSocket шлюза ГИС «Зерно» для автоматического исполнения субсидиарных контрактов АПК",
        snippet="Подключен официальный коннектор партий зерна и цифровых СДИЗ. Теперь смарт-контракты могут проверять качество урожая в реальном времени.",
        body=(
            "Запущен в эксплуатацию публичный шлюз данных для агропромышленных смарт-контрактов. "
            "Шлюз подписан квалифицированной электронной подписью и передает хэш сертификата партии непосредственно в реестр ПКСК.\n\n"
            "Доступен тестовый стенд с имитацией движения зерновых партий и проверки фитосанитарных документов."
        ),
        author_name="АгроДата Хаб",
        author_org="ГИС «Зерно» Партнер",
        author_role="Поставщик данных",
        author_role_badge="[📊 Поставщик данных]",
        author_role_class="role-data",
        author_avatar="АД",
        is_official=False,
        official_badge="Провайдер данных",
        post_type="data",
        post_type_label="📊 Оракулы & Данные",
        post_type_class="badge-type-data",
        category_id=6,
        category_slug="agro-subsidies",
        reading_time="2 мин",
        views_count=430,
        upvotes_count=37,
        is_upvoted=False,
        is_bookmarked=False,
        replies_count=1,
        tags=["ФНС_API", "АПК_Субсидии", "Оракулы", "ГИС_Зерно", "Агросделки"],
        code_snippet=(
            "// Пример верификации партии в смарт-контракте:\n"
            "struct GrainLotVerification {\n"
            "    bytes32 sdizHash;\n"
            "    uint256 weightNettoKg;\n"
            "    uint8 proteinClass;\n"
            "    uint256 timestamp;\n"
            "}\n\n"
            "function verifyLot(GrainLotVerification calldata lot) external returns (bool) {\n"
            "    require(msg.sender == GIS_ZERNO_ORACLE, 'Unauthorized Oracle');\n"
            "    require(lot.proteinClass >= 3, 'Quality below contract threshold');\n"
            "    return true;\n"
            "}"
        ),
        code_language="solidity",
        created_at="Вчера в 19:40",
        comments=[
            Comment(
                id=301,
                post_id=3,
                author_name="АгроХолдинг Юг",
                author_role="Заказчик",
                author_avatar="АЮ",
                author_role_badge="[💼 Заказчик]",
                author_role_class="role-customer",
                body="Подключаем к нашему пилоту по факторингу зерновых поставок. Спасибо за документацию!",
                created_at="Вчера в 20:20",
                likes_count=7,
            ),
        ],
    ),
    # 4. Пост от Разработчика
    Topic(
        id=4,
        title="Оптимизация gas-лимитов и структуры комиссий при пакетных B2B-выплатах в контуре Цифрового Рубля",
        snippet="Практические замеры: упаковка storage-слотов и битовые маски позволили снизить нагрузку на узлы консорциума на 34%.",
        body=(
            "При высокой частоте взаиморасчетов между контрагентами в казначейских сценариях классический вызов transfer() для каждого платежа неэффективен. "
            "Мы реализовали паттерн BatchTreasurySplitter, который объединяет до 100 сплит-платежей в одну транзакцию с компактной упаковкой получателей.\n\n"
            "Ниже приводим бенчмарки и фрагмент кода для использования сообществом."
        ),
        author_name="Иван Кузнецов",
        author_org="ООО ФинтехИнтегратор",
        author_role="Разработчик",
        author_role_badge="[👨‍💻 Разработчик]",
        author_role_class="role-dev",
        author_avatar="ИК",
        is_official=False,
        official_badge="Dev Community",
        post_type="code",
        post_type_label="💻 Стек & Код",
        post_type_class="badge-type-code",
        category_id=3,
        category_slug="treasury-b2b",
        reading_time="3 мин",
        views_count=580,
        upvotes_count=62,
        is_upvoted=False,
        is_bookmarked=False,
        replies_count=1,
        tags=["Solidity", "ЦифровойРубль", "GasOptimization", "B2B", "Казначейство"],
        code_snippet=(
            "// Упаковка получателя и суммы в единый 256-битный слот (160 бит адрес + 96 бит сумма)\n"
            "function executeBatchDisbursement(uint256[] calldata packedPayouts) external onlyAuthorized {\n"
            "    uint256 len = packedPayouts.length;\n"
            "    for (uint256 i = 0; i < len; i++) {\n"
            "        address recipient = address(uint160(packedPayouts[i]));\n"
            "        uint96 amount = uint96(packedPayouts[i] >> 160);\n"
            "        _processTransfer(recipient, amount);\n"
            "    }\n"
            "}"
        ),
        code_language="solidity",
        created_at="Вчера в 14:15",
        comments=[
            Comment(
                id=401,
                post_id=4,
                author_name="Сергей Белов",
                author_role="Разработчик",
                author_avatar="СБ",
                author_role_badge="[👨‍💻 Разработчик]",
                author_role_class="role-dev",
                body="96 бит под сумму — это до 79 миллиардов рублей в копейках, для большинства B2B-сделок запас огромный. Отличное решение!",
                created_at="Вчера в 15:00",
                likes_count=15,
            ),
        ],
    ),
    # 5. Пост от Заказчика
    Topic(
        id=5,
        title="[Заказ / Bounty 450,000 ₽] Ищем команду для разработки смарт-контракта параметрического страхования ж/д перевозок",
        snippet="Требуется разработка и верификация смарт-контракта с подключением телематических датчиков температуры и интеграцией с ЕИС Закупки.",
        body=(
            "ПАО «Логистика & Трейд» ищет аккредитованную команду или независимых разработчиков смарт-контрактов для создания модуля параметрического страхования. "
            "Контракт должен автоматически списывать компенсацию при превышении температурного режима в рефрижераторных контейнерах по данным подтвержденного IoT-оракула.\n\n"
            "Срок реализации: 6 недель. Оплата через безопасную сделку на платформе SmartContractum под защитой Umbrella-лицензии."
        ),
        author_name="ПАО Логистика & Трейд",
        author_org="Департамент цифровой трансформации",
        author_role="Заказчик",
        author_role_badge="[💼 Заказчик]",
        author_role_class="role-customer",
        author_avatar="ЛТ",
        is_official=False,
        official_badge="Bounty 450k ₽",
        post_type="job",
        post_type_label="💼 Заказ / Проект",
        post_type_class="badge-type-job",
        category_id=2,
        category_slug="safe-deals",
        reading_time="2 мин",
        views_count=890,
        upvotes_count=53,
        is_upvoted=False,
        is_bookmarked=False,
        replies_count=1,
        tags=["ЕИС_Закупки", "Заказы", "Страхование", "IoT_Оракулы", "Bounty"],
        code_snippet=None,
        code_language="solidity",
        created_at="2 дня назад",
        comments=[
            Comment(
                id=501,
                post_id=5,
                author_name="ООО СмартТехнолоджи",
                author_role="Разработчик",
                author_avatar="СТ",
                author_role_badge="[👨‍💻 Разработчик]",
                author_role_class="role-dev",
                body="Имеем готовые наработки по IoT-оракулам телематики. Отправили отклик и портфолио в личные сообщения!",
                created_at="2 дня назад",
                likes_count=11,
            ),
        ],
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
@router.get(
    "/api/v1/forum/posts",
    response_model=TopicListResponse,
    summary="Alias for topics API",
)
async def get_forum_topics(
    category_slug: Optional[str] = Query(
        None,
        description="Filter by category slug (e.g. 'safe-deals', 'oracles', 'all')",
    ),
    post_type: Optional[str] = Query(
        None,
        description="Filter by post type (e.g. 'bug', 'cbr', 'code', 'data', 'job', 'all')",
    ),
    tag: Optional[str] = Query(
        None,
        description="Filter by tag (e.g. 'Solidity', 'Оракулы')",
    ),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
) -> TopicListResponse:
    """Retrieve filtered topics ordered by newest first."""
    filtered = list(TOPICS_DB)

    if category_slug and category_slug != "all":
        filtered = [t for t in filtered if t.category_slug == category_slug]

    if post_type and post_type != "all":
        filtered = [t for t in filtered if t.post_type == post_type]

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
        post_type=post_type,
        tag=tag,
        items=paginated_items,
    )


@router.post(
    "/api/v1/forum/topics",
    response_model=TopicResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new discussion topic with automatic sanitization",
)
@router.post(
    "/api/v1/forum/posts",
    response_model=TopicResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Alias for creating a post",
)
async def create_forum_topic(payload: TopicCreateRequest) -> TopicResponse:
    """Create and validate a new forum post with XSS-safe processing."""
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
        target_cat = CATEGORIES_DB[1]  # safe-deals

    new_id = max((t.id for t in TOPICS_DB), default=0) + 1
    snippet = generate_snippet(payload.body, max_chars=200)
    created_now = "Только что"

    # Determine author avatar initials
    avatar_initials = (
        "".join([w[0] for w in payload.author_name.split()[:2]]).upper() or "SC"
    )

    # Determine role badge
    author_role_badge, author_role_class = ROLE_BADGES.get(
        payload.author_role, ("[👨‍💻 Разработчик]", "role-dev")
    )

    # Determine post type badge
    post_type = payload.post_type or "article"
    post_type_label, post_type_class = POST_TYPES.get(
        post_type, ("📝 Новость / Статья", "badge-type-article")
    )

    new_topic = Topic(
        id=new_id,
        title=payload.title,
        snippet=snippet,
        body=payload.body,
        author_name=payload.author_name,
        author_org="Umbrella-Dev Ecosystem",
        author_role=payload.author_role,
        author_role_badge=author_role_badge,
        author_role_class=author_role_class,
        author_avatar=avatar_initials,
        is_official=False,
        official_badge=None,
        post_type=post_type,
        post_type_label=post_type_label,
        post_type_class=post_type_class,
        category_id=target_cat.id,
        category_slug=target_cat.slug,
        reading_time="2 мин",
        views_count=1,
        upvotes_count=1,
        is_upvoted=True,
        is_bookmarked=False,
        replies_count=0,
        comments=[],
        tags=payload.tags or ["ПКСК", target_cat.name.split()[0]],
        code_snippet=payload.code_snippet,
        code_language=payload.code_language or "solidity",
        created_at=created_now,
    )

    TOPICS_DB.insert(0, new_topic)
    _recalculate_category_counts()

    return TopicResponse(topic=new_topic, message="Тема успешно создана")


@router.post(
    "/api/v1/forum/posts/{post_id}/upvote",
    response_model=UpvoteResponse,
    summary="Toggle upvote / like on a post",
)
async def toggle_post_upvote(post_id: int) -> UpvoteResponse:
    """Increment/decrement upvotes on a post."""
    post = next((t for t in TOPICS_DB if t.id == post_id), None)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Пост #{post_id} не найден",
        )

    if post.is_upvoted:
        post.is_upvoted = False
        post.upvotes_count = max(0, post.upvotes_count - 1)
    else:
        post.is_upvoted = True
        post.upvotes_count += 1

    return UpvoteResponse(
        post_id=post.id,
        upvotes_count=post.upvotes_count,
        is_upvoted=post.is_upvoted,
        message="Лайк обновлен",
    )


@router.post(
    "/api/v1/forum/posts/{post_id}/bookmark",
    response_model=BookmarkResponse,
    summary="Toggle bookmark status on a post",
)
async def toggle_post_bookmark(post_id: int) -> BookmarkResponse:
    """Toggle bookmark state on a post."""
    post = next((t for t in TOPICS_DB if t.id == post_id), None)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Пост #{post_id} не найден",
        )

    post.is_bookmarked = not post.is_bookmarked
    return BookmarkResponse(
        post_id=post.id,
        is_bookmarked=post.is_bookmarked,
        message="Закладка обновлена",
    )


@router.post(
    "/api/v1/forum/posts/{post_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add comment to a post",
)
async def add_post_comment(
    post_id: int, payload: CommentCreateRequest
) -> CommentResponse:
    """Add a new comment under a post."""
    post = next((t for t in TOPICS_DB if t.id == post_id), None)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Пост #{post_id} не найден",
        )

    avatar_initials = (
        "".join([w[0] for w in payload.author_name.split()[:2]]).upper() or "SC"
    )
    role_badge, role_class = ROLE_BADGES.get(
        payload.author_role, ("[👨‍💻 Разработчик]", "role-dev")
    )

    new_comment_id = (
        max(
            [c.id for t in TOPICS_DB for c in t.comments],
            default=0,
        )
        + 1
    )

    new_comment = Comment(
        id=new_comment_id,
        post_id=post.id,
        author_name=payload.author_name,
        author_role=payload.author_role,
        author_avatar=avatar_initials,
        author_role_badge=role_badge,
        author_role_class=role_class,
        body=payload.body,
        created_at="Только что",
        likes_count=0,
        is_liked=False,
    )

    post.comments.append(new_comment)
    post.replies_count = len(post.comments)

    return CommentResponse(
        comment=new_comment,
        comments_count=len(post.comments),
        message="Комментарий успешно добавлен",
    )


# ======================================================================
# SSR FORUM & SOCIAL HUB PAGE ROUTE
# ======================================================================


@router.get("/feed", summary="Feed & Dev Social Network HTML Page")
async def render_forum_page(
    request: Request,
    category: Optional[str] = Query(None, description="Active category slug"),
    post_type: Optional[str] = Query(None, description="Active post type tab"),
    tag: Optional[str] = Query(None, description="Active tag filter"),
) -> Response:
    """Render full 3-column Social Hub & Discussions HTML page."""
    _recalculate_category_counts()
    active_cat = category if isinstance(category, str) and category else "all"
    active_type = post_type if isinstance(post_type, str) and post_type else "all"

    filtered_topics = list(TOPICS_DB)
    if active_cat != "all":
        filtered_topics = [
            t for t in filtered_topics if t.category_slug == active_cat
        ]

    if active_type != "all":
        filtered_topics = [
            t for t in filtered_topics if t.post_type == active_type
        ]

    if tag and isinstance(tag, str):
        tag_clean = tag.strip().lstrip("#").lower()
        filtered_topics = [
            t
            for t in filtered_topics
            if any(tag_clean in x.lower() for x in t.tags)
        ]

    filtered_topics.sort(key=lambda t: t.id, reverse=True)

    # Extract top popular tags
    all_tags: Dict[str, int] = {}
    for topic in TOPICS_DB:
        for t in topic.tags:
            all_tags[t] = all_tags.get(t, 0) + 1
    popular_tags = sorted(all_tags.items(), key=lambda x: x[1], reverse=True)[:8]

    # Top authors for Widget 2
    top_authors = [
        {
            "name": "Алексей Смирнов",
            "org": "BI.ZONE AppSec",
            "role_badge": "[🛡️ ИБ-Аудитор]",
            "avatar": "АС",
            "reputation": "4,920",
            "posts_count": 18,
        },
        {
            "name": "Елена Васильева",
            "org": "Комитет АБР",
            "role_badge": "[🏛️ ЦБ/АБР Эксперт]",
            "avatar": "ЕВ",
            "reputation": "6,410",
            "posts_count": 24,
        },
        {
            "name": "Иван Кузнецов",
            "org": "ФинтехИнтегратор",
            "role_badge": "[👨‍💻 Разработчик]",
            "avatar": "ИК",
            "reputation": "3,850",
            "posts_count": 14,
        },
        {
            "name": "АгроДата Хаб",
            "org": "ГИС «Зерно»",
            "role_badge": "[📊 Поставщик данных]",
            "avatar": "АД",
            "reputation": "2,980",
            "posts_count": 9,
        },
    ]

    context: dict[str, Any] = {
        "active_nav": "feed",
        "categories": CATEGORIES_DB,
        "topics": filtered_topics,
        "active_category": active_cat,
        "active_post_type": active_type,
        "active_tag": tag,
        "popular_tags": popular_tags,
        "top_authors": top_authors,
        "user_org": "ООО Интегратор (Umbrella-Dev)",
        "user_avatar": "ИД",
        "nir_phase": "Фаза НИР ЦБ РФ (до 31.03.2027)",
    }
    return templates.TemplateResponse(
        request=request,
        name="forum/index.html",
        context=context,
    )