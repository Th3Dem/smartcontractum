"""Base Shell & Layout Web Router for SmartContractum Platform."""

from pathlib import Path
from fastapi import APIRouter
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
