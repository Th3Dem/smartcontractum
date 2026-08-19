"""SmartContractum Enterprise Platform Backend API Entry Point.

Architecture: FastAPI 0.115+, Python 3.12, Uvicorn, PostgreSQL, Redis.
"""

import logging
import sys
from pathlib import Path
from typing import Any, Dict
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Path discovery & robust sys.path configuration
PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent

for p in (str(PROJECT_ROOT), str(BACKEND_DIR)):
    if p not in sys.path:
        sys.path.insert(0, p)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smartcontractum")

STATIC_DIR = PROJECT_ROOT / "frontend" / "static"

app = FastAPI(
    title="SmartContractum Enterprise API",
    description="Bridge to Bank of Russia PKSC & Smart Contract Studio",
    version="2.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next: Any) -> Response:
    """Inject baseline security headers for AppSec compliance."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# Static files mount
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Include Routers
try:
    from backend.routers.home import router as home_router  # noqa: E402
    from backend.routers.passport import router as passport_router  # noqa: E402
    from backend.routers.builder import router as builder_router  # noqa: E402
    from backend.routers.data_sources import (  # noqa: E402
        router as data_sources_router,
    )
    from backend.routers.forum import router as forum_router  # noqa: E402
    from backend.routers.system import router as system_router  # noqa: E402
    from backend.routers.base import router as base_router  # noqa: E402
except ModuleNotFoundError:
    from routers.home import router as home_router  # type: ignore  # noqa: E402
    from routers.passport import router as passport_router  # type: ignore  # noqa: E402
    from routers.builder import router as builder_router  # type: ignore  # noqa: E402
    from routers.data_sources import (  # type: ignore  # noqa: E402
        router as data_sources_router,
    )
    from routers.forum import router as forum_router  # type: ignore  # noqa: E402
    from routers.system import router as system_router  # type: ignore  # noqa: E402
    from routers.base import router as base_router  # type: ignore  # noqa: E402

app.include_router(home_router)
app.include_router(passport_router)
app.include_router(builder_router)
app.include_router(data_sources_router)
app.include_router(forum_router)
app.include_router(system_router)
app.include_router(base_router)


class HealthResponse(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "ok"})
    platform: str = Field(..., json_schema_extra={"example": "SmartContractum v2.0"})
    pksc_bridge: str = Field(..., json_schema_extra={"example": "active"})
    circuit_breaker: str = Field(..., json_schema_extra={"example": "closed"})


@app.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    tags=["Monitoring"],
)
async def health_check() -> Dict[str, Any]:
    """Health check endpoint for Kubernetes / Uptime monitoring."""
    return {
        "status": "ok",
        "platform": "SmartContractum v2.0",
        "pksc_bridge": "active",
        "circuit_breaker": "closed",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
