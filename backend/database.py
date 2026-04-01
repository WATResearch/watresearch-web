from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from config import settings

# Convert postgresql:// to postgresql+asyncpg:// for async support
db_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

class Base(DeclarativeBase):
    pass


engine = create_async_engine(db_url)
async_session = async_sessionmaker(engine, expire_on_commit=False)


async def get_db():
    async with async_session() as session:
        yield session
