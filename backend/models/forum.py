import html
import re
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class Category(BaseModel):
    """Habr-style Hub category model."""

    id: int
    name: str
    slug: str
    icon: str = "📁"
    count_topics: int = 0
    subscribers_count: str = "1.2k"


class Comment(BaseModel):
    """Habr-style comment model."""

    id: int
    post_id: int
    author_name: str
    author_username: str = "developer"
    author_role: str = "Разработчик"
    author_avatar: str = "SC"
    author_role_badge: str = "[👨‍💻 Разработчик]"
    author_role_class: str = "role-dev"
    body: str
    created_at: str
    score: int = 0
    is_upvoted: bool = False


class Topic(BaseModel):
    """Habr-style article / post entity model."""

    id: int
    title: str
    snippet: str
    body: str
    author_name: str
    author_username: str = "alex_smirnov"
    author_org: Optional[str] = None
    author_role: str = "Разработчик"
    author_role_badge: str = "[👨‍💻 Разработчик]"
    author_role_class: str = "role-dev"
    author_avatar: str = "SC"
    is_official: bool = False
    official_badge: Optional[str] = None
    post_type: str = "article"
    post_type_label: str = "Статья"
    post_type_class: str = "badge-type-article"
    hubs: List[str] = Field(default_factory=list)
    category_id: int
    category_slug: str
    reading_time: str = "3 мин"
    difficulty: str = "Средний"
    views_count: int = 0
    views_formatted: str = "642"
    score: int = 0
    score_formatted: str = "+48"
    is_upvoted: bool = False
    is_downvoted: bool = False
    is_bookmarked: bool = False
    bookmarks_count: int = 12
    replies_count: int = 0
    comments: List[Comment] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    code_snippet: Optional[str] = None
    code_language: Optional[str] = "solidity"
    created_at: str


class TopicCreateRequest(BaseModel):
    """Schema for creating a new Habr-style post/article."""

    title: str = Field(
        ...,
        min_length=10,
        max_length=250,
        description="Article title (min 10 characters)",
    )
    category_slug: str = Field(
        default="safe-deals",
        min_length=2,
        max_length=100,
    )
    post_type: str = Field(
        default="article",
    )
    hubs: List[str] = Field(
        default_factory=list,
    )
    body: str = Field(
        ...,
        min_length=30,
        max_length=20000,
        description="Main text in Markdown (min 30 characters)",
    )
    code_snippet: Optional[str] = Field(
        default=None,
        max_length=10000,
    )
    code_language: Optional[str] = Field(
        default="solidity",
    )
    tags: List[str] = Field(
        default_factory=list,
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
        if not v:
            return v
        return html.escape(v.strip())

    @field_validator("tags", "hubs")
    @classmethod
    def sanitize_lists(cls, items: List[str]) -> List[str]:
        cleaned: List[str] = []
        for item in items:
            s = html.escape(item.strip().lstrip("#"))
            s_clean = re.sub(r"[^\w\-_ ]", "", s)
            if s_clean and len(s_clean) <= 60:
                cleaned.append(s_clean)
        return cleaned


class CommentCreateRequest(BaseModel):
    body: str = Field(
        ...,
        min_length=3,
        max_length=3000,
    )
    author_name: str = Field(
        default="ООО Интегратор (Umbrella-Dev)",
    )
    author_role: str = Field(
        default="Разработчик",
    )

    @field_validator("body", "author_name", "author_role")
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        if not v:
            return v
        return html.escape(v.strip())


class CategoryListResponse(BaseModel):
    total: int
    items: List[Category]


class TopicListResponse(BaseModel):
    total: int
    page: int
    limit: int
    category_slug: Optional[str] = None
    post_type: Optional[str] = None
    tag: Optional[str] = None
    q: Optional[str] = None
    sort: Optional[str] = "best"
    items: List[Topic]


class TopicResponse(BaseModel):
    topic: Topic
    message: str = "success"


class UpvoteResponse(BaseModel):
    post_id: int
    score: int
    score_formatted: str
    is_upvoted: bool
    message: str = "success"


class BookmarkResponse(BaseModel):
    post_id: int
    bookmarks_count: int
    is_bookmarked: bool
    message: str = "success"


class CommentResponse(BaseModel):
    comment: Comment
    comments_count: int
    message: str = "success"


def generate_snippet(body_text: str, max_chars: int = 250) -> str:
    plain = re.sub(r"<[^>]+>", "", body_text)
    plain = re.sub(r"\s+", " ", plain).strip()
    if len(plain) > max_chars:
        return plain[: max_chars - 3] + "..."
    return plain