"""Low-Code Builder & 5-Step Audit Simulator Router for SmartContractum."""

import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List
from fastapi import APIRouter, Request, Response
from fastapi.templating import Jinja2Templates

from backend.models.builder import (
    AuditSimulationRequest,
    AuditSimulationResponse,
    AuditStepResponse,
    BuilderNode,
)

router = APIRouter(tags=["Low-Code Builder"])

# Resolve templates path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
TEMPLATES_DIR = PROJECT_ROOT / "frontend" / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

DEFAULT_NODES: List[BuilderNode] = [
    BuilderNode(
        id="node-1",
        type="trigger",
        title="1. Входной Триггер",
        description="Инициация платежа по договору поставки №409-АПК",
        badge_type="amber",
    ),
    BuilderNode(
        id="node-2",
        type="oracle",
        title="2. Проверка Оракула / ГИС",
        description="Запрос статуса приемки в ГИС Зерно + валидация в ФНС",
        badge_type="cyan",
    ),
    BuilderNode(
        id="node-3",
        type="action",
        title="3. Исполняющее Действие",
        description="Распоряжение на перевод Цифровых Рублей на ПлЦР Поставщика",
        badge_type="emerald",
    ),
]

FIVE_AUDIT_STEPS: List[AuditStepResponse] = [
    AuditStepResponse(
        step_number=1,
        step_name="1. Описание логики",
        status="completed",
        description="Паспорт и Дерево решений валидированы по стандарту ПКСК",
        duration_ms=150,
    ),
    AuditStepResponse(
        step_number=2,
        step_name="2. Авто-проверка кода",
        status="completed",
        description="SAST сканирование (Bandit / Trivy): 0 критических дефектов",
        duration_ms=280,
    ),
    AuditStepResponse(
        step_number=3,
        step_name="3. Экспертный ИБ-аудит",
        status="completed",
        description="Симуляция профиля безопасности Standoff 365 / BI.ZONE: OK",
        duration_ms=450,
    ),
    AuditStepResponse(
        step_number=4,
        step_name="4. Тестовая среда",
        status="completed",
        description="Стресс-тест нагрузки 1 500 TPS: коллизий не обнаружено",
        duration_ms=320,
    ),
    AuditStepResponse(
        step_number=5,
        step_name="5. Публикация на Витрине",
        status="completed",
        description="Контрольная сумма зафиксирована в Реестре доверенных контрактов",
        duration_ms=210,
    ),
]


@router.post(
    "/api/v1/builder/simulate-audit",
    response_model=AuditSimulationResponse,
    summary="Simulate 5-step Bank of Russia Smart Contract Pre-Audit",
)
async def simulate_audit_endpoint(
    payload: AuditSimulationRequest = AuditSimulationRequest(),
) -> AuditSimulationResponse:
    """Run full 5-stage pre-audit compliance pipeline simulation."""
    contract_id = payload.contract_id or "SC-2026-PKSC-0042"
    timestamp_str = datetime.now(timezone.utc).isoformat()

    # Generate a deterministic SHA256 integrity hash
    hash_seed = f"{contract_id}:{payload.scenario_title}:{timestamp_str}"
    sha256_hash = hashlib.sha256(hash_seed.encode("utf-8")).hexdigest()

    return AuditSimulationResponse(
        contract_id=contract_id,
        is_success=True,
        overall_score="A+ (Регуляторный комплаенс ЦБ РФ)",
        sha256_hash=sha256_hash,
        steps=FIVE_AUDIT_STEPS,
        timestamp=timestamp_str,
    )


@router.get("/builder", summary="Visual Low-Code Builder Page")
async def render_builder_page(request: Request) -> Response:
    """Render the 2-column Low-Code Builder and Audit Pipeline page."""
    context: Dict[str, Any] = {
        "active_nav": "builder",
        "nodes": DEFAULT_NODES,
        "audit_steps": FIVE_AUDIT_STEPS,
        "user_org": "ООО Интегратор (Umbrella-Dev)",
        "nir_phase": "Фаза НИР ЦБ РФ (до 31.03.2027)",
    }
    return templates.TemplateResponse(
        request=request,
        name="builder/index.html",
        context=context,
    )
