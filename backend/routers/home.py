"""Home & Hero Section Router for SmartContractum Platform."""

from pathlib import Path
from typing import Any, Dict
from fastapi import APIRouter, Request, Response
from fastapi.templating import Jinja2Templates

router = APIRouter(tags=["Home & Hero Section"])

# Resolve absolute path to templates
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
TEMPLATES_DIR = PROJECT_ROOT / "frontend" / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

DEFAULT_CONTEXT = {
    "user_org": "ООО Интегратор (Umbrella-Dev)",
    "nir_phase": "Фаза НИР ЦБ РФ (до 31.03.2027)",
    "status_notice": (
        "Статус: Официальный сбор обратной связи по Концепции ПКСК (до 30.09.2026)"
    ),
}

STATS_DATA = {
    "experts_count": "1 480+",
    "passports_count": "342",
    "data_sources_count": "58",
    "verified_scenarios_count": "126",
}


@router.get("/", summary="Main Landing & Interactive Task Router")
async def render_home_page(request: Request) -> Response:
    """Render main homepage with Hero banner and 4 Task Selector routes."""
    context: Dict[str, Any] = {
        "active_nav": "home",
        "stats": STATS_DATA,
        **DEFAULT_CONTEXT,
    }
    return templates.TemplateResponse(
        request=request,
        name="home/index.html",
        context=context,
    )


@router.get("/forum", summary="Forum Community Alias")
async def render_forum_alias(request: Request) -> Response:
    """Route /forum alias to forum index."""
    from backend.routers.forum import render_forum_page

    return await render_forum_page(request=request, category=None, tag=None)
