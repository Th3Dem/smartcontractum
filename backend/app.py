"""SmartContractum Enterprise Platform Backend API Entry Point.

Architecture: FastAPI 0.115+, Python 3.12, Uvicorn, PostgreSQL, Redis.
"""

import logging
from pathlib import Path
from typing import Any, Dict
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smartcontractum")

# Path discovery
PROJECT_ROOT = Path(__file__).resolve().parent.parent
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

# Include Base Shell Routers
from routers.base import router as base_router  # noqa: E402

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

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
