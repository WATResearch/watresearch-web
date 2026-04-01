from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class BlogCreate(BaseModel):
    title: str
    slug: str
    description: str
    content: str
    tags: list[str] = []
    author: str
    published: bool = False


class BlogUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    description: str | None = None
    content: str | None = None
    tags: list[str] | None = None
    author: str | None = None
    published: bool | None = None


class BlogResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    description: str
    content: str
    tags: list[str]
    author: str
    published: bool
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedBlogResponse(BaseModel):
    items: list[BlogResponse]
    total: int
    page: int
    page_size: int
