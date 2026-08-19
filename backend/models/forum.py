import html
import re
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class Category(BaseModel):
    """Forum category model."""

    id: int
    name: str
    slug: str
    icon: str = "📁"
    count_topics: int = 0


class Tag(BaseModel):
    """Forum topic tag model."""

    id: int
    name: str
    slug: str


class Topic(BaseModel):
    """Forum topic full entity model."""

    id: int
    title: str
    snippet: str
    body: str
    author_name: str
    author_role: str = "Разработчик"
    author_avatar: str = "SC"
    is_official: bool = False
    official_badge: Optional[str] = None
    category_id: int
    category_slug: str
    views_count: int = 0
    replies_count: int = 0
    tags: List[str] = Field(default_factory=list)
    created_at: str


class TopicCreateRequest(BaseModel):
    """Schema for incoming new topic creation request."""

    title: str = Field(
        ...,
        min_length=10,
        max_length=250,
        description="Topic title (minimum 10 characters)",
    )
    category_slug: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Slug of target category",
    )
    body: str = Field(
        ...,
        min_length=30,
        max_length=15000,
        description="Main topic body in Markdown or text (minimum 30 characters)",
    )
    tags: List[str] = Field(
        default_factory=list,
        description="List of tag strings",
    )
    author_name: str = Field(
        default="ООО Интегратор (Umbrella-Dev)",
        max_length=120,
    )
    author_role: str = Field(
        default="Umbrella-Dev",
        max_length=80,
    )

    @field_validator("title", "body", "author_name", "author_role")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        """Sanitize incoming text strings against XSS injection."""
        if not v:
            return v
        # Strip dangerous HTML script / iframe tags and escape raw HTML
        clean = html.escape(v.strip())
        return clean

    @field_validator("tags")
    @classmethod
    def sanitize_tags(cls, tags: List[str]) -> List[str]:
        """Normalize and sanitize tag strings."""
        cleaned_tags: List[str] = []
        for tag in tags:
            tag_str = html.escape(tag.strip().lstrip("#"))
            # remove non-alphanumeric except underscore and hyphen
            tag_clean = re.sub(r"[^\w\-_]", "", tag_str)
            if tag_clean and len(tag_clean) <= 50:
                cleaned_tags.append(tag_clean)
        return cleaned_tags


class CategoryListResponse(BaseModel):
    """Response containing list of categories with counts."""

    total: int
    items: List[Category]


class TopicListResponse(BaseModel):
    """Response containing paginated list of topics."""

    total: int
    page: int
    limit: int
    category_slug: Optional[str] = None
    tag: Optional[str] = None
    items: List[Topic]


class TopicResponse(BaseModel):
    """Single topic response."""

    topic: Topic
    message: str = "success"


def generate_snippet(body_text: str, max_chars: int = 200) -> str:
    """Generate a clean snippet from topic body up to max_chars."""
    plain = re.sub(r"<[^>]+>", "", body_text)
    plain = re.sub(r"\s+", " ", plain).strip()
    if len(plain) > max_chars:
        return plain[: max_chars - 3] + "..."
    return plain
