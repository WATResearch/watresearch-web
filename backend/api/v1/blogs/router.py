from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db

from . import service
from .schemas import BlogResponse

router = APIRouter()


@router.get("/", response_model=list[BlogResponse])
async def list_blogs(db: AsyncSession = Depends(get_db)):
    return await service.get_blogs(db, published_only=True)


@router.get("/{slug}", response_model=BlogResponse)
async def get_blog(slug: str, db: AsyncSession = Depends(get_db)):
    blog = await service.get_blog_by_slug(db, slug)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog
