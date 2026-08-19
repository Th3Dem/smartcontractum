"""Home & Hero Section Router for SmartContractum Platform."""

from pathlib import Path
from typing import Any, Dict, Optional
from fastapi import APIRouter, Query, Request, Response
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
    """Render main homepage with Hero banner and 6 Action Selector routes."""
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


@router.get("/solutions", summary="Ready Solutions & Component Catalog")
async def render_solutions_catalog(request: Request) -> Response:
    """Route /solutions to Low-Code builder templates and pre-built contract catalog."""
    context: Dict[str, Any] = {
        "active_nav": "builder",
        "tab": "templates",
        **DEFAULT_CONTEXT,
    }
    return templates.TemplateResponse(
        request=request,
        name="builder/index.html",
        context=context,
    )


@router.get("/marketplace/services", summary="Specialist & Services Marketplace")
async def render_services_marketplace(
    request: Request,
    role: Optional[str] = Query(None, description="Filter by specialist/service role"),
) -> Response:
    """Route to Specialist Services Marketplace with optional role pre-filter."""
    from backend.routers.profile import render_profile_page

    return await render_profile_page(request=request)


@router.get("/profile/join", summary="Specialist Onboarding & Registration")
async def render_profile_join(request: Request) -> Response:
    """Route /profile/join to Specialist Onboarding profile view."""
    from backend.routers.profile import render_profile_page

    return await render_profile_page(request=request)


@router.get("/knowledge", summary="Knowledge Base & PKSC Research Hub")
async def render_knowledge_hub(request: Request) -> Response:
    """Route /knowledge to Knowledge Base & Discussions forum."""
    from backend.routers.forum import render_forum_page

    return await render_forum_page(request=request, category=None, tag=None)


@router.get("/forum", summary="Forum Community Alias")
async def render_forum_alias(request: Request) -> Response:
    """Route /forum alias to forum index."""
    from backend.routers.forum import render_forum_page

    return await render_forum_page(request=request, category=None, tag=None)
