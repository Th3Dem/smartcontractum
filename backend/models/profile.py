"""Data models and schemas for SmartContractum Profile & Umbrella Developer Workspace."""

import html
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class UserProfile(BaseModel):
    """Schema representing a professional specialist profile."""

    id: int
    full_name: str
    role_title: str
    company: str
    bio: str
    avatar_initials: str = "АВ"
    is_umbrella_approved: bool = True
    reputation_score: int = 985
    created_passports_count: int = 18
    published_contracts_count: int = 7
    forum_replies_count: int = 42
    audits_conducted_count: int = 14
    skills: List[str] = Field(default_factory=list)


class UmbrellaContract(BaseModel):
    """Schema representing a smart contract submitted for Umbrella publishing."""

    id: int
    author_id: int
    title: str
    version: str
    passport_code: str
    royalty_percent: float
    status: str
    status_badge_class: str
    executions_count: int = 0
    total_earnings_rub: float = 0.0
    created_at: str


class RoyaltyLedger(BaseModel):
    """Schema representing a royalty payout ledger record."""

    id: int
    contract_title: str
    transaction_hash: str
    amount_rub: float
    execution_timestamp: str
    payout_status: str


class UmbrellaSubmitRequest(BaseModel):
    """Payload for submitting a contract to Umbrella publishing."""

    title: str = Field(..., min_length=5, max_length=150)
    version: str = Field(default="v1.0.0", max_length=20)
    passport_code: str = Field(..., min_length=5, max_length=60)
    royalty_percent: float = Field(
        ...,
        ge=0.1,
        le=50.0,
        description="Desired royalty percentage (0.1% to 50.0%)",
    )
    agreed_terms: bool = Field(
        ...,
        description="Agreement with SmartContractum Umbrella License terms",
    )

    @field_validator("agreed_terms")
    @classmethod
    def validate_agreement(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Необходимо согласие с условиями лицензионного договора")
        return v

    @field_validator("title", "version", "passport_code")
    @classmethod
    def sanitize_strings(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        return html.escape(v.strip())


class UmbrellaSubmitResponse(BaseModel):
    """Response returned upon submitting an Umbrella contract."""

    status: str = "success"
    message: str
    contract_id: int
    tracking_code: str
    created_at: str


class EarningsSummaryResponse(BaseModel):
    """Summary of financial royalty statistics."""

    total_executions: int
    total_earnings_rub: float
    available_payout_rub: float
    ledger: List[RoyaltyLedger]
