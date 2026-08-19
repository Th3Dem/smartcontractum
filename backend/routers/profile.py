"""Profile & Umbrella Developer Workspace Router for SmartContractum."""

import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List
from fastapi import APIRouter, Request, Response, status
from fastapi.templating import Jinja2Templates

from backend.models.profile import (
    EarningsSummaryResponse,
    RoyaltyLedger,
    UmbrellaContract,
    UmbrellaSubmitRequest,
    UmbrellaSubmitResponse,
    UserProfile,
)

router = APIRouter(tags=["Profile & Umbrella Workspace"])

# Resolve templates path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
TEMPLATES_DIR = PROJECT_ROOT / "frontend" / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

# In-Memory Seed Data for Current Specialist Profile
CURRENT_USER = UserProfile(
    id=101,
    full_name="Александр Волков",
    role_title="Senior Smart Contract Architect & Lead Auditor",
    company="ООО Интегратор (Umbrella-Dev)",
    bio=(
        "Архитектура смарт-контрактов для ПлЦР и распределенных реестров. "
        "Эксперт по пред-аудиту безопасности и регуляторному комплаенсу ЦБ РФ."
    ),
    avatar_initials="АВ",
    is_umbrella_approved=True,
    reputation_score=985,
    created_passports_count=18,
    published_contracts_count=7,
    forum_replies_count=42,
    audits_conducted_count=14,
    skills=[
        "#FastAPI",
        "#SmartContracts",
        "#Audit",
        "#CBDC",
        "#Python",
        "#LowCode",
        "#ПКСК_2026",
    ],
)

CONTRACTS_STORE: List[UmbrellaContract] = [
    UmbrellaContract(
        id=1,
        author_id=101,
        title="Автоматическая оплата поставки зерна №409-АПК",
        version="v1.2.0",
        passport_code="SC-2026-PKSC-AGRO-01",
        royalty_percent=1.5,
        status="Опубликован на Витрине ПКСК",
        status_badge_class="status-published",
        executions_count=1420,
        total_earnings_rub=142000.0,
        created_at="12.07.2026",
    ),
    UmbrellaContract(
        id=2,
        author_id=101,
        title="Эскроу безопасных B2B сделок",
        version="v2.0.1",
        passport_code="SC-2026-PKSC-B2B-04",
        royalty_percent=2.0,
        status="Передан Оператору ПКСК",
        status_badge_class="status-review",
        executions_count=420,
        total_earnings_rub=42000.0,
        created_at="03.08.2026",
    ),
    UmbrellaContract(
        id=3,
        author_id=101,
        title="Факторинг с верификацией в ФНС",
        version="v1.0.0",
        passport_code="SC-2026-PKSC-FACT-09",
        royalty_percent=1.0,
        status="Пред-Аудит ИБ (Внутренний)",
        status_badge_class="status-audit",
        executions_count=0,
        total_earnings_rub=0.0,
        created_at="18.08.2026",
    ),
]

LEDGER_STORE: List[RoyaltyLedger] = [
    RoyaltyLedger(
        id=1,
        contract_title="Поставка зерна №409-АПК",
        transaction_hash="0x7f2a9c14e8b39d01f2",
        amount_rub=1500.0,
        execution_timestamp="19.08.2026, 18:42",
        payout_status="Выплачено",
    ),
    RoyaltyLedger(
        id=2,
        contract_title="Поставка зерна №409-АПК",
        transaction_hash="0x3b1c8f49e0a27d65b4",
        amount_rub=1500.0,
        execution_timestamp="19.08.2026, 14:15",
        payout_status="Выплачено",
    ),
    RoyaltyLedger(
        id=3,
        contract_title="Эскроу безопасных B2B сделок",
        transaction_hash="0x9e8a7d6c5b4a3f2e1d",
        amount_rub=2000.0,
        execution_timestamp="19.08.2026, 11:30",
        payout_status="В обработке",
    ),
    RoyaltyLedger(
        id=4,
        contract_title="Поставка зерна №409-АПК",
        transaction_hash="0x4d5e6f7a8b9c0d1e2f",
        amount_rub=1500.0,
        execution_timestamp="18.08.2026, 22:10",
        payout_status="В обработке",
    ),
]


@router.get(
    "/api/v1/profile/me",
    response_model=UserProfile,
    summary="Get current user professional profile",
)
async def get_my_profile() -> UserProfile:
    """Return profile details for current authorized specialist."""
    return CURRENT_USER


@router.get(
    "/api/v1/profile/umbrella/earnings",
    response_model=EarningsSummaryResponse,
    summary="Get royalty earnings dashboard and transaction ledger",
)
async def get_earnings_api() -> EarningsSummaryResponse:
    """Return financial royalty statistics and payouts ledger."""
    total_execs = sum(c.executions_count for c in CONTRACTS_STORE)
    total_earnings = sum(c.total_earnings_rub for c in CONTRACTS_STORE)
    available_payout = 42500.0

    return EarningsSummaryResponse(
        total_executions=total_execs,
        total_earnings_rub=total_earnings,
        available_payout_rub=available_payout,
        ledger=LEDGER_STORE,
    )


@router.post(
    "/api/v1/profile/umbrella/submit",
    response_model=UmbrellaSubmitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit smart contract for Umbrella Publishing",
)
async def submit_umbrella_contract_api(
    payload: UmbrellaSubmitRequest,
) -> UmbrellaSubmitResponse:
    """Submit a contract to be published on CBR PKSC under Umbrella integrator."""
    now_str = datetime.now().strftime("%d.%m.%Y")
    new_id = len(CONTRACTS_STORE) + 1

    hash_seed = f"{payload.title}:{payload.passport_code}:{datetime.now(timezone.utc).isoformat()}"
    tracking_code = (
        f"UMB-PKSC-{hashlib.sha256(hash_seed.encode()).hexdigest()[:8].upper()}"
    )

    new_contract = UmbrellaContract(
        id=new_id,
        author_id=CURRENT_USER.id,
        title=payload.title,
        version=payload.version,
        passport_code=payload.passport_code,
        royalty_percent=payload.royalty_percent,
        status="Пред-Аудит ИБ (Внутренний)",
        status_badge_class="status-audit",
        executions_count=0,
        total_earnings_rub=0.0,
        created_at=now_str,
    )
    CONTRACTS_STORE.insert(0, new_contract)

    return UmbrellaSubmitResponse(
        status="success",
        message=(
            "Контракт успешно подан на Umbrella-публикацию и направлен "
            "в конвейер внутреннего пред-аудита ИБ."
        ),
        contract_id=new_id,
        tracking_code=tracking_code,
        created_at=now_str,
    )


@router.get("/profile", summary="Specialist Profile & Umbrella Workspace Page")
async def render_profile_page(request: Request) -> Response:
    """Render full Profile and Umbrella Workspace HTML page."""
    total_execs = sum(c.executions_count for c in CONTRACTS_STORE)
    total_earnings = sum(c.total_earnings_rub for c in CONTRACTS_STORE)

    context: Dict[str, Any] = {
        "active_nav": "profile",
        "user": CURRENT_USER,
        "contracts": CONTRACTS_STORE,
        "ledger": LEDGER_STORE,
        "total_executions": total_execs,
        "total_earnings": total_earnings,
        "available_payout": 42500.0,
        "user_org": "ООО Интегратор (Umbrella-Dev)",
        "nir_phase": "Фаза НИР ЦБ РФ (до 31.03.2027)",
    }
    return templates.TemplateResponse(
        request=request,
        name="profile/index.html",
        context=context,
    )
