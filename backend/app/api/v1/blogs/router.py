from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

from . import service
from .schemas import BlogResponse, PaginatedBlogResponse

router = APIRouter()


@router.get("/", response_model=PaginatedBlogResponse)
async def list_blogs(page: int = 1, page_size: int = 10, db: AsyncSession = Depends(get_db)):
    items, total = await service.get_blogs(db, published_only=True, page=page, page_size=page_size)
    return PaginatedBlogResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{slug}", response_model=BlogResponse)
async def get_blog(slug: str, db: AsyncSession = Depends(get_db)):
    blog = await service.get_blog_by_slug(db, slug)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog
