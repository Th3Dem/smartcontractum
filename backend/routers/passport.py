"""Passport Generator & Wizard Router for SmartContractum."""

from datetime import datetime
from pathlib import Path
from typing import Any, Dict
from fastapi import APIRouter, Request, Response, status
from fastapi.templating import Jinja2Templates

from backend.models.passport import PassportCreate, PassportResponse
from backend.services.passport_engine import (
    generate_decision_tree,
    process_passport_creation,
)

router = APIRouter(tags=["Passport Wizard"])

# Resolve templates path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
TEMPLATES_DIR = PROJECT_ROOT / "frontend" / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

# In-memory storage of generated passports
PASSPORTS_STORE: list[PassportResponse] = []

SAMPLE_DEFAULT_PAYLOAD = PassportCreate(
    title="Автоматическая оплата поставки сельхозпродукции",
    parties="ООО АгроЭкспорт (Покупатель), КФХ Зерновое (Поставщик), ПАО Банк-Гарант",
    trigger_event="Подписание универсального передаточного документа (УПД) в ГИС Зерно",
    exception_flow="Несоответствие качества партии зерна или таймаут приемки > 14 дней",
    data_source_type="ГИС (Государственная информационная система)",
    success_action="Мгновенный перевод средств из Эскроу на расчетный счет Поставщика",
)


@router.post(
    "/api/v1/passport/generate",
    response_model=PassportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate Smart Contract Passport and Decision Tree Logic",
)
async def generate_passport(payload: PassportCreate) -> PassportResponse:
    """Generate structured decision tree and markdown specification from business parameters."""
    code, tree, full_md = process_passport_creation(payload)
    new_id = len(PASSPORTS_STORE) + 1
    now_str = datetime.now().strftime("%d.%m.%Y, %H:%M")

    response_item = PassportResponse(
        id=new_id,
        title=payload.title,
        passport_code=code,
        decision_tree_text=tree,
        full_passport_markdown=full_md,
        created_at=now_str,
    )
    PASSPORTS_STORE.append(response_item)
    return response_item


@router.get("/passport", summary="Passport Generator Wizard Page")
async def render_passport_page(request: Request) -> Response:
    """Render full Passport Generator and Decision Tree Preview page."""
    sample_code = "SC-2026-PKSC-DEMO-001"
    sample_tree = generate_decision_tree(SAMPLE_DEFAULT_PAYLOAD, sample_code)

    context: Dict[str, Any] = {
        "active_nav": "passport",
        "sample": SAMPLE_DEFAULT_PAYLOAD,
        "sample_tree": sample_tree,
        "sample_code": sample_code,
        "user_org": "ООО Интегратор (Umbrella-Dev)",
        "nir_phase": "Фаза НИР ЦБ РФ (до 31.03.2027)",
    }
    return templates.TemplateResponse(
        request=request,
        name="passport/index.html",
        context=context,
    )
