from fastapi import APIRouter

from .blogs.router import router as blogs_router

router = APIRouter()
router.include_router(blogs_router, prefix="/blogs", tags=["blogs"])
