"""Data models and schemas for SmartContractum Data Sources & Oracle Hub."""

import html
import re
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class DataSource(BaseModel):
    """Schema representing an external trusted data source or oracle."""

    id: int
    name: str
    description: str
    cbr_category: str
    category_slug: str
    trust_level: str
    trust_badge_class: str
    sla_percent: str
    monetization_type: str
    is_active: bool = True


class DataSourceListResponse(BaseModel):
    """List response for data sources marketplace."""

    total: int
    items: List[DataSource]


class DataSourceSuggest(BaseModel):
    """Payload for suggesting a new oracle or data source."""

    name: str = Field(..., min_length=3, max_length=120)
    cbr_category: str = Field(
        ...,
        min_length=2,
        max_length=80,
        description="Государственная ИС, Коммерческая ИС, Открытый источник",
    )
    api_type: str = Field(
        default="REST API",
        max_length=50,
        description="REST, gRPC, SOAP, WebSocket",
    )
    contact_email: str = Field(..., min_length=5, max_length=120)
    description: str = Field(..., min_length=10, max_length=500)

    @field_validator("contact_email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Validate email format."""
        email_pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(email_pattern, v.strip()):
            raise ValueError("Некорректный формат адреса электронной почты")
        return v.strip().lower()

    @field_validator("name", "cbr_category", "api_type", "description")
    @classmethod
    def sanitize_strings(cls, v: Optional[str]) -> Optional[str]:
        """Sanitize strings against HTML/XSS injection."""
        if not v:
            return v
        return html.escape(v.strip())


class DataSourceSuggestResponse(BaseModel):
    """Response returned upon proposing a new data source."""

    status: str = "success"
    message: str
    application_id: str
    timestamp: str
