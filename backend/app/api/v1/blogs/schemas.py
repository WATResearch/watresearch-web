from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


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
