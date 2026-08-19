"""Data models and schemas for SmartContractum Passport Wizard and Decision Tree."""

import html
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class PassportCreate(BaseModel):
    """Payload for generating a Smart Contract Passport."""

    title: str = Field(
        ...,
        min_length=5,
        max_length=200,
        description="Business scenario title",
    )
    parties: str = Field(
        ...,
        min_length=5,
        max_length=300,
        description="Contract parties (comma separated)",
    )
    trigger_event: str = Field(
        ...,
        min_length=5,
        max_length=300,
        description="Execution trigger event / condition",
    )
    exception_flow: str = Field(
        ...,
        min_length=5,
        max_length=300,
        description="Exceptions, dispute resolution, or timeouts",
    )
    data_source_type: str = Field(
        default="ГИС (Государственная информационная система)",
        max_length=100,
        description="Type of data source (GIS, Commercial, Open Oracle)",
    )
    success_action: Optional[str] = Field(
        default="Мгновенный перевод средств из Эскроу на счет Поставщика",
        max_length=300,
        description="Action executed upon successful trigger confirmation",
    )

    @field_validator(
        "title",
        "parties",
        "trigger_event",
        "exception_flow",
        "data_source_type",
        "success_action",
    )
    @classmethod
    def sanitize_strings(cls, v: Optional[str]) -> Optional[str]:
        """Sanitize inputs against HTML/XSS injection."""
        if not v:
            return v
        return html.escape(v.strip())


class PassportResponse(BaseModel):
    """Response model for generated Smart Contract Passport."""

    id: int
    title: str
    passport_code: str
    decision_tree_text: str
    full_passport_markdown: str
    created_at: str
