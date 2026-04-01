from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.blog import Blog


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
