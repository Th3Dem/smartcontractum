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
    DraftDeleteResponse,
    DraftResponse,
    DraftSaveRequest,
    Topic,
    TopicCreateRequest,
    TopicListResponse,
    TopicResponse,
    UpvoteResponse,
    generate_snippet,
)

router = APIRouter(tags=["Habr-Style Dev Feed & Platform"])
templates = Jinja2Templates(directory="frontend/templates")

# ======================================================================
# IN-MEMORY HABR HUBS & POSTS DATABASE
# ======================================================================

CATEGORIES_DB: List[Category] = [
    Category(id=1, name="Все потоки", slug="all", icon="🔥", count_topics=5, subscribers_count="18.4k"),
    Category(id=2, name="Разработка смарт-контрактов", slug="smart-contracts", icon="💻", count_topics=2, subscribers_count="12.1k"),
    Category(id=3, name="Информационная безопасность", slug="infosec-audit", icon="🛡️", count_topics=1, subscribers_count="9.8k"),
    Category(id=4, name="Оракулы & Данные", slug="oracles", icon="🌐", count_topics=1, subscribers_count="6.5k"),
    Category(id=5, name="Казначейство & B2B", slug="treasury-b2b", icon="🏦", count_topics=1, subscribers_count="5.2k"),
    Category(id=6, name="Регуляторика & ЦБ РФ", slug="safe-deals", icon="🏛️", count_topics=1, subscribers_count="8.9k"),
]

ROLE_BADGES = {
    "Разработчик": ("[👨‍💻 Разработчик]", "role-dev"),
    "ИБ-Аудитор": ("[🛡️ ИБ-Аудитор]", "role-auditor"),
    "Поставщик данных": ("[📊 Поставщик данных]", "role-data"),
    "ЦБ/АБР Эксперт": ("[🏛️ ЦБ/АБР Эксперт]", "role-cbr"),
    "Заказчик": ("[💼 Заказчик]", "role-customer"),
}

TOPICS_DB: List[Topic] = [
    # 1. Пост от ИБ-Аудитора
    Topic(
        id=1,
        title="Разбор уязвимости Reentrancy при асинхронном вызове оракулов в контуре ПКСК",
        snippet=(
            "Команда BI.ZONE и SmartContractum Security исследовала типовые ошибки интеграции внешних поставщиков котировок. "
            "Показываем, как задержка в коллбеке оракула позволяет опустошить эскроу-пул и как защититься паттерном CEI."
        ),
        body=(
            "В рамках подготовки к кибер-учениям Standoff 365 мы провели аудит более 40 смарт-контрактов из реестра Банка России. "
            "Наиболее частая архитектурная ошибка — предположение о мгновенном отклике оракула.\n\n"
            "Если ваш смарт-контракт осуществляет выплату до фиксации внутреннего состояния `isFulfilled = true`, злоумышленник может инициировать повторный вход в функцию `fulfill()`.\n\n"
            "### Рекомендации по безопасности:\n"
            "1. Строго соблюдайте последовательность **Checks-Effects-Interactions**.\n"
            "2. Подключайте модификатор `nonReentrant` из открытой библиотеки SmartContractum Core.\n"
            "3. Используйте таймлоки на вывод крупных сумм."
        ),
        author_name="Алексей Смирнов",
        author_username="alex_security",
        author_org="BI.ZONE Security Lab",
        author_role="ИБ-Аудитор",
        author_role_badge="[🛡️ ИБ-Аудитор]",
        author_role_class="role-auditor",
        author_avatar="АС",
        is_official=True,
        official_badge="Блог компании BI.ZONE",
        post_type="bug",
        post_type_label="Баги & Уязвимости",
        post_type_class="badge-type-bug",
        hubs=["Информационная безопасность*", "Разработка смарт-контрактов*", "Solidity*", "Bug Bounty"],
        category_id=3,
        category_slug="infosec-audit",
        reading_time="4 мин",
        difficulty="Сложный",
        views_count=3420,
        views_formatted="3.4K",
        score=68,
        score_formatted="+68",
        is_upvoted=False,
        is_downvoted=False,
        is_bookmarked=False,
        bookmarks_count=24,
        replies_count=2,
        tags=["Solidity", "Standoff365", "BugBounty", "Reentrancy", "Оракулы"],
        code_snippet=(
            "// ❌ Уязвимый сценарий вызова оракула:\n"
            "function fulfillOracleData(bytes32 requestId, uint256 price) external onlyOracle {\n"
            "    payable(beneficiary).transfer(escrowAmount);\n"
            "    requestFulfilled[requestId] = true; // Состояние меняется ПОСЛЕ перевода!\n"
            "}\n\n"
            "// ✅ Безопасный паттерн CEI (Checks-Effects-Interactions):\n"
            "function fulfillOracleData(bytes32 requestId, uint256 price) external onlyOracle nonReentrant {\n"
            "    require(!requestFulfilled[requestId], 'Already fulfilled');\n"
            "    requestFulfilled[requestId] = true; // Сначала эффект!\n"
            "    (bool ok, ) = payable(beneficiary).call{value: escrowAmount}('');\n"
            "    require(ok, 'Transfer failed');\n"
            "}"
        ),
        code_language="solidity",
        created_at="сегодня в 18:20",
        comments=[
            Comment(
                id=101,
                post_id=1,
                author_name="Дмитрий Волков",
                author_username="dmitry_dev",
                author_role="Разработчик",
                author_avatar="ДВ",
                author_role_badge="[👨‍💻 Разработчик]",
                author_role_class="role-dev",
                body="Отличный разбор! Добавили статический анализатор Slither с этим правилом в наш CI-контур.",
                created_at="сегодня в 18:45",
                score=14,
            ),
            Comment(
                id=102,
                post_id=1,
                author_name="SmartContractum Bot",
                author_username="sc_audit_bot",
                author_role="ИБ-Аудитор",
                author_avatar="SC",
                author_role_badge="[🛡️ ИБ-Аудитор]",
                author_role_class="role-auditor",
                body="Патч включен в официальный релиз SDK платформы SmartContractum v1.4.0.",
                created_at="сегодня в 19:10",
                score=9,
            ),
        ],
    ),
    # 2. Пост от Эксперта ЦБ/АБР
    Topic(
        id=2,
        title="Процедура третейского арбитража в ПКСК: как разрешать споры при рассинхронизации оракулов",
        snippet=(
            "Комитет АБР открывает публичную дискуссию по проекту регламента технического арбитража. "
            "Обсуждаем тайм-ауты эскроу-заморозки и критерии кворума валидаторов до окончания фазы НИР 30.09.2026."
        ),
        body=(
            "В концепции ПКСК Банка России заложен принцип детерминированного исполнения контрактов. "
            "Однако в реальных сделках возможна ситуация, когда первичные источники данных (например, ГИС ЭДО и таможенный шлюз) дают противоречивые показания.\n\n"
            "Предлагается трехуровневая модель арбитража:\n"
            "1. **Автоматическая пауза**: эскроу блокируется на 48 часов при расхождении данных.\n"
            "2. **Децентрализованное голосование**: подключение пула независимых оракулов-валидаторов.\n"
            "3. **Правовой арбитраж**: ручная загрузка юридически значимой первичной документации с КЭП."
        ),
        author_name="Елена Васильева",
        author_username="elena_abr",
        author_org="Комитет АБР & Консорциум",
        author_role="ЦБ/АБР Эксперт",
        author_role_badge="[🏛️ ЦБ/АБР Эксперт]",
        author_role_class="role-cbr",
        author_avatar="ЕВ",
        is_official=True,
        official_badge="Рабочая группа ЦБ РФ",
        post_type="cbr",
        post_type_label="ЦБ РФ & Право",
        post_type_class="badge-type-cbr",
        hubs=["Регуляторика & ЦБ РФ*", "FinTech*", "Безопасные сделки*", "Арбитраж"],
        category_id=6,
        category_slug="safe-deals",
        reading_time="5 мин",
        difficulty="Средний",
        views_count=5210,
        views_formatted="5.2K",
        score=94,
        score_formatted="+94",
        is_upvoted=False,
        is_downvoted=False,
        is_bookmarked=True,
        bookmarks_count=48,
        replies_count=2,
        tags=["Арбитраж", "ПКСК_2026", "ЦБ_РФ", "Регламент", "БезопасныеСделки"],
        code_snippet=None,
        code_language="solidity",
        created_at="сегодня в 16:10",
        comments=[
            Comment(
                id=201,
                post_id=2,
                author_name="Михаил Орлов",
                author_username="m_orlov",
                author_role="ЦБ/АБР Эксперт",
                author_avatar="МО",
                author_role_badge="[🏛️ ЦБ/АБР Эксперт]",
                author_role_class="role-cbr",
                body="Для крупных B2B-сделок 48 часов — идеальный срок, позволяющий подтянуть оффлайн-первичку через Диадок.",
                created_at="сегодня в 16:40",
                score=22,
            ),
            Comment(
                id=202,
                post_id=2,
                author_name="ООО СтрахФин",
                author_username="strah_fin",
                author_role="Заказчик",
                author_avatar="СФ",
                author_role_badge="[💼 Заказчик]",
                author_role_class="role-customer",
                body="Поддерживаем инициативу. Готовы принять участие в закрытом тестировании арбитражного смарт-контракта.",
                created_at="сегодня в 17:15",
                score=16,
            ),
        ],
    ),
    # 3. Пост от Поставщика данных
    Topic(
        id=3,
        title="Подключаем смарт-контракты к ГИС «Зерно»: готовый шлюз и WebSocket-оракул для АПК-субсидий",
        snippet=(
            "Релиз открытого коннектора партий зерна и цифровых СДИЗ. "
            "Разбираем структуру криптографической подписи партии и интеграцию с реестром Банка России."
        ),
        body=(
            "Для автоматического выделения субсидий агропроизводителям необходим непрерывный мониторинг параметров качества урожая. "
            "Мы развернули доверенный шлюз, транслирующий данные ФГИС «Зерно» в контур ПКСК.\n\n"
            "Оракул передает хеш партии, процент протеина, класс зерна и отметку о прохождении фитосанитарного контроля. "
            "Смарт-контракт автоматически сверяет данные с пороговыми значениями договора и выполняет взаиморасчет."
        ),
        author_name="АгроДата Хаб",
        author_username="agro_data",
        author_org="ГИС «Зерно» Партнер",
        author_role="Поставщик данных",
        author_role_badge="[📊 Поставщик данных]",
        author_role_class="role-data",
        author_avatar="АД",
        is_official=False,
        official_badge="Провайдер данных",
        post_type="data",
        post_type_label="Оракулы & Данные",
        post_type_class="badge-type-data",
        hubs=["Оракулы & Данные*", "АПК & Субсидии*", "Разработка смарт-контрактов*", "API"],
        category_id=4,
        category_slug="oracles",
        reading_time="3 мин",
        difficulty="Простой",
        views_count=2180,
        views_formatted="2.2K",
        score=45,
        score_formatted="+45",
        is_upvoted=False,
        is_downvoted=False,
        is_bookmarked=False,
        bookmarks_count=15,
        replies_count=1,
        tags=["ФНС_API", "АПК_Субсидии", "Оракулы", "ГИС_Зерно", "Агросделки"],
        code_snippet=(
            "// Пример структуры данных оракула зерновых партий:\n"
            "struct GrainLotVerification {\n"
            "    bytes32 sdizHash;       // Хэш сертификата СДИЗ\n"
            "    uint256 weightNettoKg;  // Вес партии в кг\n"
            "    uint8 proteinClass;     // Класс зерна (3-5)\n"
            "    uint256 timestamp;      // Метка времени фиксации\n"
            "}\n\n"
            "function verifyAndRelease(GrainLotVerification calldata lot) external onlyOracle {\n"
            "    require(lot.proteinClass >= 3, 'Quality below required standard');\n"
            "    escrowSettled = true;\n"
            "    emit GrainSubsidyApproved(lot.sdizHash, lot.weightNettoKg);\n"
            "}"
        ),
        code_language="solidity",
        created_at="вчера в 19:40",
        comments=[
            Comment(
                id=301,
                post_id=3,
                author_name="АгроХолдинг Юг",
                author_username="agro_south",
                author_role="Заказчик",
                author_avatar="АЮ",
                author_role_badge="[💼 Заказчик]",
                author_role_class="role-customer",
                body="Спасибо за готовый пример! Забираем в свой пилотный проект по элеваторам.",
                created_at="вчера в 20:20",
                score=8,
            ),
        ],
    ),
    # 4. Пост от Разработчика
    Topic(
        id=4,
        title="Оптимизация gas и транзакционных издержек при миллионных B2B-выплатах в Цифровом Рубле",
        snippet=(
            "Как упаковать 100 сплит-платежей в одну транзакцию: битовая упаковка адресов и сумм, "
            "кастомный ассемблер и замеры экономии на узлах консорциума."
        ),
        body=(
            "При масштабных взаиморасчетах в казначейских системах индивидуальные переводы приводят к перегрузке узлов валидации. "
            "Мы реализовали компактную упаковку данных: 160 бит на адрес получателя + 96 бит на сумму в копейках.\n\n"
            "Это позволяет уместить каждый платеж в ровно одно 256-битное слово (Word), снижая расходы на память и вызовы EVM на 34%."
        ),
        author_name="Иван Кузнецов",
        author_username="ivan_kuznetsov",
        author_org="ООО ФинтехИнтегратор",
        author_role="Разработчик",
        author_role_badge="[👨‍💻 Разработчик]",
        author_role_class="role-dev",
        author_avatar="ИК",
        is_official=False,
        official_badge="Блог автора",
        post_type="code",
        post_type_label="Стек & Код",
        post_type_class="badge-type-code",
        hubs=["Разработка смарт-контрактов*", "Казначейство & B2B*", "Цифровой Рубль*", "Оптимизация"],
        category_id=2,
        category_slug="smart-contracts",
        reading_time="4 мин",
        difficulty="Сложный",
        views_count=4120,
        views_formatted="4.1K",
        score=76,
        score_formatted="+76",
        is_upvoted=False,
        is_downvoted=False,
        is_bookmarked=False,
        bookmarks_count=31,
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
        created_at="вчера в 14:15",
        comments=[
            Comment(
                id=401,
                post_id=4,
                author_name="Сергей Белов",
                author_username="s_belov",
                author_role="Разработчик",
                author_avatar="СБ",
                author_role_badge="[👨‍💻 Разработчик]",
                author_role_class="role-dev",
                body="96 бит под сумму — это до 79 млрд рублей с точностью до копеек, для любого корпоративного сплита с головой!",
                created_at="вчера в 15:00",
                score=18,
            ),
        ],
    ),
    # 5. Пост от Заказчика
    Topic(
        id=5,
        title="[Заказ / Bounty 450,000 ₽] Разработка смарт-контракта параметрического страхования рефрижераторных ж/д поставок",
        snippet=(
            "Ищем команду или независимого разработчика для создания контракта с интеграцией IoT-датчиков температуры "
            "и автоматическим выставлением штрафов через ЕИС Закупки."
        ),
        body=(
            "ПАО «Логистика & Трейд» объявляет конкурс на реализацию модуля параметрического страхования скоропортящихся грузов. "
            "Контракт должен в режиме реального времени получать телеметрию датчиков и в случае нарушения температурного режима производить списание неустойки.\n\n"
            "### Требования к кандидатам:\n"
            "- Опыт работы со стандартами ПКСК Банка России;\n"
            "- Наличие пройденного аудита в профиле SmartContractum;\n"
            "- Срок реализации: 6 недель с оплатой через эскроу платформы."
        ),
        author_name="ПАО Логистика & Трейд",
        author_username="logistics_trade",
        author_org="Департамент цифровой трансформации",
        author_role="Заказчик",
        author_role_badge="[💼 Заказчик]",
        author_role_class="role-customer",
        author_avatar="ЛТ",
        is_official=False,
        official_badge="Bounty 450,000 ₽",
        post_type="job",
        post_type_label="Заказ / Проект",
        post_type_class="badge-type-job",
        hubs=["Заказы & Проекты*", "Страхование*", "IoT*", "ЕИС Закупки"],
        category_id=5,
        category_slug="treasury-b2b",
        reading_time="2 мин",
        difficulty="Средний",
        views_count=3890,
        views_formatted="3.9K",
        score=58,
        score_formatted="+58",
        is_upvoted=False,
        is_downvoted=False,
        is_bookmarked=False,
        bookmarks_count=21,
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
                author_username="smart_tech",
                author_role="Разработчик",
                author_avatar="СТ",
                author_role_badge="[👨‍💻 Разработчик]",
                author_role_class="role-dev",
                body="Имеем готовые наработки по IoT-оракулам телематики. Отправили отклик и портфолио!",
                created_at="2 дня назад",
                score=12,
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
    summary="Get all Habr hubs with counters",
)
async def get_forum_categories() -> CategoryListResponse:
    _recalculate_category_counts()
    return CategoryListResponse(total=len(CATEGORIES_DB), items=CATEGORIES_DB)


@router.get(
    "/api/v1/forum/topics",
    response_model=TopicListResponse,
    summary="Get paginated Habr articles/posts",
)
@router.get(
    "/api/v1/forum/posts",
    response_model=TopicListResponse,
    summary="Alias for topics API",
)
async def get_forum_topics(
    category_slug: Optional[str] = Query(None),
    post_type: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    q: Optional[str] = Query(None, description="Keyword search query"),
    sort: Optional[str] = Query("best", description="Sorting: 'best', 'new', 'discussed'"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
) -> TopicListResponse:
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

    # Keyword search across title, body, snippet, hubs, tags, author
    if q and q.strip():
        q_clean = q.strip().lower()
        filtered = [
            t for t in filtered
            if (
                q_clean in t.title.lower()
                or q_clean in t.body.lower()
                or q_clean in t.snippet.lower()
                or any(q_clean in h.lower() for h in t.hubs)
                or any(q_clean in tg.lower() for tg in t.tags)
                or q_clean in t.author_name.lower()
                or (t.author_org and q_clean in t.author_org.lower())
                or (t.code_snippet and q_clean in t.code_snippet.lower())
            )
        ]

    # Sorting
    if sort == "new":
        filtered.sort(key=lambda t: t.id, reverse=True)
    elif sort == "discussed":
        filtered.sort(key=lambda t: t.replies_count, reverse=True)
    else:  # 'best'
        filtered.sort(key=lambda t: t.score, reverse=True)

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
        q=q,
        sort=sort,
        items=paginated_items,
    )


@router.post(
    "/api/v1/forum/topics",
    response_model=TopicResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Habr post",
)
@router.post(
    "/api/v1/forum/posts",
    response_model=TopicResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Alias for creating post",
)
async def create_forum_topic(payload: TopicCreateRequest) -> TopicResponse:
    _recalculate_category_counts()

    target_cat = next(
        (c for c in CATEGORIES_DB if c.slug == payload.category_slug and c.slug != "all"),
        None,
    )
    if not target_cat:
        target_cat = CATEGORIES_DB[1]

    new_id = max((t.id for t in TOPICS_DB), default=0) + 1
    snippet = generate_snippet(payload.body, max_chars=250)
    created_now = "только что"

    avatar_initials = "".join([w[0] for w in payload.author_name.split()[:2]]).upper() or "SC"
    author_role_badge, author_role_class = ROLE_BADGES.get(
        payload.author_role, ("[👨‍💻 Разработчик]", "role-dev")
    )

    new_topic = Topic(
        id=new_id,
        title=payload.title,
        snippet=snippet,
        body=payload.body,
        author_name=payload.author_name,
        author_username="author_" + str(new_id),
        author_org="Umbrella-Dev",
        author_role=payload.author_role,
        author_role_badge=author_role_badge,
        author_role_class=author_role_class,
        author_avatar=avatar_initials,
        is_official=False,
        official_badge=None,
        post_type=payload.post_type or "article",
        post_type_label="Статья",
        post_type_class="badge-type-article",
        hubs=payload.hubs or [target_cat.name + "*", "ПКСК*"],
        category_id=target_cat.id,
        category_slug=target_cat.slug,
        reading_time="3 мин",
        difficulty="Средний",
        views_count=1,
        views_formatted="1",
        score=1,
        score_formatted="+1",
        is_upvoted=True,
        is_downvoted=False,
        is_bookmarked=False,
        bookmarks_count=0,
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
    summary="Toggle upvote / rating on a post",
)
async def toggle_post_upvote(post_id: int) -> UpvoteResponse:
    post = next((t for t in TOPICS_DB if t.id == post_id), None)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Пост #{post_id} не найден",
        )

    if post.is_upvoted:
        post.is_upvoted = False
        post.score -= 1
    else:
        post.is_upvoted = True
        post.score += 1

    post.score_formatted = f"+{post.score}" if post.score > 0 else str(post.score)

    return UpvoteResponse(
        post_id=post.id,
        score=post.score,
        score_formatted=post.score_formatted,
        is_upvoted=post.is_upvoted,
        message="Рейтинг обновлен",
    )


@router.post(
    "/api/v1/forum/posts/{post_id}/bookmark",
    response_model=BookmarkResponse,
    summary="Toggle bookmark status on a post",
)
async def toggle_post_bookmark(post_id: int) -> BookmarkResponse:
    post = next((t for t in TOPICS_DB if t.id == post_id), None)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Пост #{post_id} не найден",
        )

    post.is_bookmarked = not post.is_bookmarked
    if post.is_bookmarked:
        post.bookmarks_count += 1
    else:
        post.bookmarks_count = max(0, post.bookmarks_count - 1)

    return BookmarkResponse(
        post_id=post.id,
        bookmarks_count=post.bookmarks_count,
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
    post = next((t for t in TOPICS_DB if t.id == post_id), None)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Пост #{post_id} не найден",
        )

    avatar_initials = "".join([w[0] for w in payload.author_name.split()[:2]]).upper() or "SC"
    role_badge, role_class = ROLE_BADGES.get(
        payload.author_role, ("[👨‍💻 Разработчик]", "role-dev")
    )

    new_comment_id = max([c.id for t in TOPICS_DB for c in t.comments], default=0) + 1

    new_comment = Comment(
        id=new_comment_id,
        post_id=post.id,
        author_name=payload.author_name,
        author_username="dev_user",
        author_role=payload.author_role,
        author_avatar=avatar_initials,
        author_role_badge=role_badge,
        author_role_class=role_class,
        body=payload.body,
        created_at="только что",
        score=0,
        is_upvoted=False,
    )

    post.comments.append(new_comment)
    post.replies_count = len(post.comments)

    return CommentResponse(
        comment=new_comment,
        comments_count=len(post.comments),
        message="Комментарий успешно добавлен",
    )


# ======================================================================
# SSR HABR-STYLE FEED PAGE ROUTE
# ======================================================================


@router.get("/feed", summary="Habr-Style Dev Feed HTML Page")
async def render_forum_page(
    request: Request,
    stream: Optional[str] = Query(None, description="Active stream/category slug"),
    category: Optional[str] = Query(None, description="Alias for category slug"),
    sort: Optional[str] = Query("best", description="Sort: best, new, discussed"),
    tag: Optional[str] = Query(None, description="Active tag filter"),
    q: Optional[str] = Query(None, description="Keyword search query"),
) -> Response:
    _recalculate_category_counts()
    active_stream = stream or category or "all"
    active_sort = sort if isinstance(sort, str) and sort in ["best", "new", "discussed"] else "best"

    # Find active category name
    matched_cat = next((c for c in CATEGORIES_DB if c.slug == active_stream), None)
    active_category_name = matched_cat.name if matched_cat else "Все потоки"
    active_category_icon = matched_cat.icon if matched_cat else "📁"

    filtered_topics = list(TOPICS_DB)
    if active_stream != "all":
        filtered_topics = [t for t in filtered_topics if t.category_slug == active_stream]

    if tag and isinstance(tag, str):
        tag_clean = tag.strip().lstrip("#").lower()
        filtered_topics = [
            t for t in filtered_topics if any(tag_clean in x.lower() for x in t.tags)
        ]

    # Keyword search filtering
    if q and isinstance(q, str) and q.strip():
        q_clean = q.strip().lower()
        filtered_topics = [
            t for t in filtered_topics
            if (
                q_clean in t.title.lower()
                or q_clean in t.body.lower()
                or q_clean in t.snippet.lower()
                or any(q_clean in h.lower() for h in t.hubs)
                or any(q_clean in tg.lower() for tg in t.tags)
                or q_clean in t.author_name.lower()
                or (t.author_org and q_clean in t.author_org.lower())
                or (t.code_snippet and q_clean in t.code_snippet.lower())
            )
        ]

    if active_sort == "new":
        filtered_topics.sort(key=lambda t: t.id, reverse=True)
    elif active_sort == "discussed":
        filtered_topics.sort(key=lambda t: t.replies_count, reverse=True)
    else:
        filtered_topics.sort(key=lambda t: t.score, reverse=True)

    # Trending Now widget (Top 5 read)
    trending_articles = sorted(TOPICS_DB, key=lambda t: t.views_count, reverse=True)[:5]

    # Popular Hubs
    popular_hubs = [
        {"name": "Разработка смарт-контрактов", "slug": "smart-contracts", "subs": "12.1k", "rating": "840"},
        {"name": "Информационная безопасность", "slug": "infosec-audit", "subs": "9.8k", "rating": "720"},
        {"name": "Регуляторика & ЦБ РФ", "slug": "safe-deals", "subs": "8.9k", "rating": "650"},
        {"name": "Оракулы & Данные", "slug": "oracles", "subs": "6.5k", "rating": "490"},
        {"name": "Казначейство & B2B", "slug": "treasury-b2b", "subs": "5.2k", "rating": "380"},
    ]

    # Top Authors / Companies
    top_companies = [
        {"name": "BI.ZONE AppSec", "logo": "🛡️", "posts": "24 публикации", "rating": "+1,420"},
        {"name": "Банк России (НИР)", "logo": "🏛️", "posts": "18 публикаций", "rating": "+2,890"},
        {"name": "ФинтехИнтегратор", "logo": "⚡", "posts": "31 публикация", "rating": "+940"},
        {"name": "ГИС «Зерно» Партнер", "logo": "🌾", "posts": "12 публикаций", "rating": "+630"},
    ]

    context: dict[str, Any] = {
        "active_nav": "feed",
        "categories": CATEGORIES_DB,
        "topics": filtered_topics,
        "active_stream": active_stream,
        "active_category": active_stream,
        "active_category_name": active_category_name,
        "active_category_icon": active_category_icon,
        "active_sort": active_sort,
        "active_tag": tag,
        "active_query": q or "",
        "trending_articles": trending_articles,
        "popular_hubs": popular_hubs,
        "top_companies": top_companies,
        "user_name": "developer",
        "user_avatar": "SC",
    }
    return templates.TemplateResponse(
        request=request,
        name="forum/index.html",
        context=context,
    )


@router.get("/feed/create", summary="Habr-Style Article Creation & Editor Page")
@router.get("/articles/create", summary="Alias for Habr Article Editor Page")
async def render_article_editor_page(request: Request) -> Response:
    """Render the full Habr Article Editor page for drafting and publishing articles."""
    _recalculate_category_counts()

    context: dict[str, Any] = {
        "active_nav": "feed",
        "categories": CATEGORIES_DB,
        "user_name": "developer",
        "user_avatar": "SC",
    }
    return templates.TemplateResponse(
        request=request,
        name="forum/editor.html",
        context=context,
    )


# ======================================================================
# ARTICLE DRAFT STORAGE API
# ======================================================================

_GLOBAL_DRAFT: Optional[DraftSaveRequest] = None


@router.post(
    "/api/v1/forum/drafts",
    response_model=DraftResponse,
    summary="Save article draft to server",
)
async def save_article_draft(payload: DraftSaveRequest) -> DraftResponse:
    """Persist the current article draft."""
    global _GLOBAL_DRAFT
    _GLOBAL_DRAFT = payload
    return DraftResponse(draft=_GLOBAL_DRAFT, has_draft=True, message="Draft saved successfully")


@router.get(
    "/api/v1/forum/drafts",
    response_model=DraftResponse,
    summary="Get saved article draft",
)
async def get_article_draft() -> DraftResponse:
    """Retrieve the latest saved article draft."""
    if _GLOBAL_DRAFT:
        return DraftResponse(draft=_GLOBAL_DRAFT, has_draft=True, message="Draft retrieved")
    return DraftResponse(draft=None, has_draft=False, message="No draft found")


@router.delete(
    "/api/v1/forum/drafts",
    response_model=DraftDeleteResponse,
    summary="Clear saved article draft",
)
async def clear_article_draft() -> DraftDeleteResponse:
    """Clear the stored article draft upon publication."""
    global _GLOBAL_DRAFT
    _GLOBAL_DRAFT = None
    return DraftDeleteResponse(message="Draft cleared successfully")
