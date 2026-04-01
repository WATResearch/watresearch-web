from fastapi import Depends, FastAPI
from sqlalchemy import text

from auth import get_current_user
from database import get_db, engine

app = FastAPI()


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