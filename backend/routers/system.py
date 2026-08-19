from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/system", tags=["System"])


@router.get("/stats")
async def get_system_stats():
    return {
        "status": "success",
        "stats": {
            "experts_count": 142,
            "passports_count": 38,
            "data_sources_count": 19,
            "verified_scenarios_count": 15,
        },
        "phase": (
            "Официальный сбор обратной связи по Концепции ПКСК (до 30.09.2026)"
        ),
    }
