from pathlib import Path

from sqladmin import Admin
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request

BASE_DIR = Path(__file__).resolve().parent.parent

from app.config import settings
from app.database import engine


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
        if username == settings.admin_username and password == settings.admin_password:
            request.session.update({"authenticated": True})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return request.session.get("authenticated", False)


def setup_admin(app):
    auth_backend = AdminAuth(secret_key=settings.supabase_jwt_secret)
    admin = Admin(app, engine, authentication_backend=auth_backend, templates_dir=str(BASE_DIR / "templates"))
