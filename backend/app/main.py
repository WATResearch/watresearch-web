from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.admin import setup_admin
from app.api.v1.router import router as v1_router
from app.auth import get_current_user
from app.config import settings
from app.database import engine

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(v1_router, prefix="/api/v1")
setup_admin(app)


@app.get("/")
async def root():
    return {"message": "Hello from WatResearch!"}


@app.get("/health/db")
async def health_db():
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    return {"status": "ok"}


@app.get("/me")
async def me(user=Depends(get_current_user)):
    return {"user_id": user["sub"], "email": user.get("email")}