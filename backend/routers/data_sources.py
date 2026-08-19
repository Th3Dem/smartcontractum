"""Data Sources Marketplace and Oracle Hub Router for SmartContractum."""

import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Query, Request, Response, status
from fastapi.templating import Jinja2Templates

from backend.models.data_sources import (
    DataSource,
    DataSourceListResponse,
    DataSourceSuggest,
    DataSourceSuggestResponse,
)

router = APIRouter(tags=["Data Sources & Oracle Hub"])

# Resolve templates path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
TEMPLATES_DIR = PROJECT_ROOT / "frontend" / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

# In-Memory Seed Data for CBR Data Sources Marketplace
SEED_DATA_SOURCES: List[DataSource] = [
    DataSource(
        id=1,
        name="ФНС России (СМЭВ 3/4)",
        description=(
            "Проверка статуса юридических лиц, налоговой благонадежности "
            "и электронной подписи актов."
        ),
        cbr_category="Государственная ИС",
        category_slug="gis",
        trust_level="Высокий (ГИС)",
        trust_badge_class="trust-gis",
        sla_percent="99.99%",
        monetization_type="Бесплатно / Гос.регламент",
        is_active=True,
    ),
    DataSource(
        id=2,
        name="ЕИС Закупки (44-ФЗ / 223-ФЗ)",
        description=(
            "Фиксация факта исполнения государственных контрактов "
            "и этапов закрывающих документов."
        ),
        cbr_category="Государственная ИС",
        category_slug="gis",
        trust_level="Высокий (ГИС)",
        trust_badge_class="trust-gis",
        sla_percent="99.9%",
        monetization_type="Бесплатно / Гос.регламент",
        is_active=True,
    ),
    DataSource(
        id=3,
        name="Межбанковский Оракул (ПАО ФинТех)",
        description=(
            "Шлюз передачи статусов банковских гарантий, "
            "факторинговых реестров и счетов эскроу."
        ),
        cbr_category="Коммерческая ИС",
        category_slug="commercial",
        trust_level="Высокий (Лицензирован)",
        trust_badge_class="trust-commercial",
        sla_percent="99.99%",
        monetization_type="Плата за 1 000 запросов",
        is_active=True,
    ),
    DataSource(
        id=4,
        name="Московская Биржа (MOEX Data API)",
        description=(
            "Котировки валютных пар USD/RUB, CNY/RUB, "
            "товарные индексы зерна и металлов в реальном времени."
        ),
        cbr_category="Открытый источник",
        category_slug="open",
        trust_level="Средний (Маркирован)",
        trust_badge_class="trust-open",
        sla_percent="99.5%",
        monetization_type="Фиксированная подписка",
        is_active=True,
    ),
]

SUGGESTIONS_STORE: List[Dict[str, Any]] = []


@router.get(
    "/api/v1/data-sources",
    response_model=DataSourceListResponse,
    summary="Get list of trusted data sources with optional category filter",
)
async def get_data_sources_api(
    category: Optional[str] = Query(
        None, description="Category filter: all, gis, commercial, open"
    ),
) -> DataSourceListResponse:
    """Return filtered data sources marketplace catalog."""
    if not category or category.lower() == "all":
        return DataSourceListResponse(
            total=len(SEED_DATA_SOURCES), items=SEED_DATA_SOURCES
        )

    cat_clean = category.lower().strip()
    filtered = [
        s
        for s in SEED_DATA_SOURCES
        if s.category_slug.lower() == cat_clean
        or s.cbr_category.lower() == cat_clean
    ]
    return DataSourceListResponse(total=len(filtered), items=filtered)


@router.post(
    "/api/v1/data-sources/suggest",
    response_model=DataSourceSuggestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Suggest a new data source or oracle provider",
)
async def suggest_data_source_api(
    payload: DataSourceSuggest,
) -> DataSourceSuggestResponse:
    """Submit a proposal for a new external data source."""
    timestamp_str = datetime.now(timezone.utc).isoformat()
    hash_seed = f"{payload.name}:{payload.contact_email}:{timestamp_str}"
    app_id = f"APP-SRC-{hashlib.sha256(hash_seed.encode('utf-8')).hexdigest()[:8].upper()}"

    SUGGESTIONS_STORE.append(
        {
            "application_id": app_id,
            "data": payload.model_dump(),
            "created_at": timestamp_str,
        }
    )

    return DataSourceSuggestResponse(
        status="success",
        message=(
            "Заявка на добавление источника успешно принята "
            "и передана в регуляторный комитет ПКСК."
        ),
        application_id=app_id,
        timestamp=timestamp_str,
    )


@router.get("/data-sources", summary="Data Sources Marketplace Page")
async def render_data_sources_page(
    request: Request, category: Optional[str] = None
) -> Response:
    """Render full Data Sources and Oracle Marketplace page."""
    current_category = category or "all"
    if current_category == "all":
        sources_list = SEED_DATA_SOURCES
    else:
        sources_list = [
            s
            for s in SEED_DATA_SOURCES
            if s.category_slug == current_category
            or s.cbr_category == current_category
        ]

    context: Dict[str, Any] = {
        "active_nav": "sources",
        "current_category": current_category,
        "sources": sources_list,
        "total_sources": len(SEED_DATA_SOURCES),
        "user_org": "ООО Интегратор (Umbrella-Dev)",
        "nir_phase": "Фаза НИР ЦБ РФ (до 31.03.2027)",
    }
    return templates.TemplateResponse(
        request=request,
        name="data_sources/index.html",
        context=context,
    )


@router.get("/sources", summary="Data Sources Alias")
async def render_sources_alias(request: Request) -> Response:
    """Alias for /data-sources."""
    return await render_data_sources_page(request=request)
