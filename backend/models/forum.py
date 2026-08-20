import html
import re
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class Category(BaseModel):
    """Forum & Social category model."""

    id: int
    name: str
    slug: str
    icon: str = "📁"
    count_topics: int = 0


class Tag(BaseModel):
    """Topic tag model."""

    id: int
    name: str
    slug: str


class Comment(BaseModel):
    """Comment under a post."""

    id: int
    post_id: int
    author_name: str
    author_role: str = "Разработчик"
    author_avatar: str = "SC"
    author_role_badge: str = "[👨‍💻 Разработчик]"
    author_role_class: str = "role-developer"
    body: str
    created_at: str
    likes_count: int = 0
    is_liked: bool = False


class Topic(BaseModel):
    """Forum & Social post entity model."""

    id: int
    title: str
    snippet: str
    body: str
    author_name: str
    author_org: Optional[str] = None
    author_role: str = "Разработчик"
    author_role_badge: str = "[👨‍💻 Разработчик]"
    author_role_class: str = "role-developer"
    author_avatar: str = "SC"
    is_official: bool = False
    official_badge: Optional[str] = None
    post_type: str = "article"  # 'cbr', 'bug', 'code', 'data', 'job', 'idea', 'article'
    post_type_label: str = "📝 Статья"
    post_type_class: str = "type-article"
    category_id: int
    category_slug: str
    reading_time: str = "2 мин"
    views_count: int = 0
    upvotes_count: int = 0
    is_upvoted: bool = False
    is_bookmarked: bool = False
    replies_count: int = 0
    comments: List[Comment] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    code_snippet: Optional[str] = None
    code_language: Optional[str] = "solidity"
    created_at: str


class TopicCreateRequest(BaseModel):
    """Schema for incoming new post / topic creation request."""

    title: str = Field(
        ...,
        min_length=10,
        max_length=250,
        description="Post title (minimum 10 characters)",
    )
    category_slug: str = Field(
        default="safe-deals",
        min_length=2,
        max_length=100,
        description="Slug of target category",
    )
    post_type: str = Field(
        default="article",
        description="Type of post: article, bug, job, idea, code, cbr, data",
    )
    body: str = Field(
        ...,
        min_length=30,
        max_length=15000,
        description="Main post body in Markdown (minimum 30 characters)",
    )
    code_snippet: Optional[str] = Field(
        default=None,
        max_length=10000,
        description="Optional code snippet",
    )
    code_language: Optional[str] = Field(
        default="solidity",
        max_length=50,
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
        default="Разработчик",
        max_length=80,
    )

    @field_validator("title", "body", "author_name", "author_role")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        """Sanitize incoming text strings against XSS injection."""
        if not v:
            return v
        clean = html.escape(v.strip())
        return clean

    @field_validator("tags")
    @classmethod
    def sanitize_tags(cls, tags: List[str]) -> List[str]:
        """Normalize and sanitize tag strings."""
        cleaned_tags: List[str] = []
        for tag in tags:
            tag_str = html.escape(tag.strip().lstrip("#"))
            tag_clean = re.sub(r"[^\w\-_]", "", tag_str)
            if tag_clean and len(tag_clean) <= 50:
                cleaned_tags.append(tag_clean)
        return cleaned_tags


class CommentCreateRequest(BaseModel):
    """Schema for adding a comment to a post."""

    body: str = Field(
        ...,
        min_length=3,
        max_length=3000,
        description="Comment text (minimum 3 characters)",
    )
    author_name: str = Field(
        default="ООО Интегратор (Umbrella-Dev)",
        max_length=120,
    )
    author_role: str = Field(
        default="Разработчик",
        max_length=80,
    )

    @field_validator("body", "author_name", "author_role")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        """Sanitize incoming comment against XSS."""
        if not v:
            return v
        return html.escape(v.strip())


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
    post_type: Optional[str] = None
    tag: Optional[str] = None
    items: List[Topic]


class TopicResponse(BaseModel):
    """Single topic response."""

    topic: Topic
    message: str = "success"


class UpvoteResponse(BaseModel):
    """Upvote action toggle response."""

    post_id: int
    upvotes_count: int
    is_upvoted: bool
    message: str = "success"


class BookmarkResponse(BaseModel):
    """Bookmark action toggle response."""

    post_id: int
    is_bookmarked: bool
    message: str = "success"


class CommentResponse(BaseModel):
    """Comment addition response."""

    comment: Comment
    comments_count: int
    message: str = "success"


def generate_snippet(body_text: str, max_chars: int = 200) -> str:
    """Generate a clean snippet from topic body up to max_chars."""
    plain = re.sub(r"<[^>]+>", "", body_text)
    plain = re.sub(r"\s+", " ", plain).strip()
    if len(plain) > max_chars:
        return plain[: max_chars - 3] + "..."
    return plain