"""Base Shell & Layout Web Router for SmartContractum Platform."""

from pathlib import Path
from typing import Any
from fastapi import APIRouter, Request, Response
from fastapi.templating import Jinja2Templates

router = APIRouter(tags=["Base Shell"])

# Resolve absolute path to templates
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
TEMPLATES_DIR = PROJECT_ROOT / "frontend" / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

DEFAULT_CONTEXT = {
    "user_org": "ООО Интегратор (Umbrella-Dev)",
    "nir_phase": "Фаза НИР ЦБ РФ (до 31.03.2027)",
}


@router.get("/builder", summary="Visual Decision Tree Builder")
async def render_builder(request: Request) -> Response:
    """Render Smart Contract Decision Tree Builder."""
    context: dict[str, Any] = {
        "active_nav": "builder",
        **DEFAULT_CONTEXT,
    }
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context=context,
    )


@router.get("/sources", summary="Trusted Oracle Sources")
async def render_sources(request: Request) -> Response:
    """Render Trusted Oracle Sources Registry."""
    context: dict[str, Any] = {
        "active_nav": "sources",
        **DEFAULT_CONTEXT,
    }
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context=context,
    )
