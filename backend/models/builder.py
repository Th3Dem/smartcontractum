"""Data models and schemas for SmartContractum Low-Code Builder & 5-Step Audit Simulator."""

import html
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class BuilderNode(BaseModel):
    """Schema for a visual node on the low-code builder canvas."""

    id: str = Field(..., description="Unique node identifier")
    type: str = Field(..., description="Node type: trigger, oracle, action")
    title: str = Field(..., min_length=2, max_length=150)
    description: str = Field(..., max_length=300)
    badge_type: str = Field(default="primary")

    @field_validator("title", "description", "type")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        """Sanitize strings against HTML/XSS injection."""
        return html.escape(v.strip()) if v else v


class AuditStepResponse(BaseModel):
    """Schema for a single stage in the 5-step Bank of Russia pre-audit pipeline."""

    step_number: int = Field(..., ge=1, le=5)
    step_name: str
    status: str = Field(default="completed")
    description: str
    duration_ms: int = Field(default=120)


class AuditSimulationRequest(BaseModel):
    """Payload for starting an audit simulation."""

    contract_id: Optional[str] = Field(default="SC-2026-DEMO")
    scenario_title: Optional[str] = Field(
        default="Инициация платежа по договору №409-АПК"
    )


class AuditSimulationResponse(BaseModel):
    """Result of 5-step pre-audit pipeline simulation."""

    contract_id: str
    is_success: bool = True
    overall_score: str = "A+ (Compliant)"
    sha256_hash: str
    steps: List[AuditStepResponse]
    timestamp: str
