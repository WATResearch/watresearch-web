from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.blog import Blog

from .schemas import BlogCreate, BlogUpdate


async def get_blogs(db: AsyncSession, published_only: bool = False, page: int = 1, page_size: int = 10):
    query = select(Blog).order_by(Blog.created_at.desc())
    if published_only:
        query = query.where(Blog.published.is_(True))

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()

    result = await db.execute(query.offset((page - 1) * page_size).limit(page_size))
    return result.scalars().all(), total


async def get_blog_by_slug(db: AsyncSession, slug: str):
    result = await db.execute(select(Blog).where(Blog.slug == slug))
    return result.scalar_one_or_none()


async def get_blog_by_id(db: AsyncSession, blog_id: UUID):
    result = await db.execute(select(Blog).where(Blog.id == blog_id))
    return result.scalar_one_or_none()


async def create_blog(db: AsyncSession, data: BlogCreate):
    blog = Blog(**data.model_dump())
    if blog.published:
        blog.published_at = datetime.now(timezone.utc)
    db.add(blog)
    await db.commit()
    await db.refresh(blog)
    return blog


async def update_blog(db: AsyncSession, blog: Blog, data: BlogUpdate):
    updates = data.model_dump(exclude_unset=True)
    if "published" in updates and updates["published"] and not blog.published:
        updates["published_at"] = datetime.now(timezone.utc)
    for key, value in updates.items():
        setattr(blog, key, value)
    await db.commit()
    await db.refresh(blog)
    return blog


async def delete_blog(db: AsyncSession, blog: Blog):
    await db.delete(blog)
    await db.commit()
