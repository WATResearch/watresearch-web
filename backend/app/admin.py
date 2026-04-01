from sqladmin import Admin, ModelView
from wtforms import TextAreaField
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request

from app.config import settings
from app.database import engine
from app.models.blog import Blog


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


class BlogAdmin(ModelView, model=Blog):
    column_list = [Blog.title, Blog.slug, Blog.author, Blog.published, Blog.created_at]
    column_searchable_list = [Blog.title, Blog.author]
    column_sortable_list = [Blog.title, Blog.created_at, Blog.published]
    form_include_pk = False
    form_overrides = {"content": TextAreaField}
    form_args = {"content": {"render_kw": {"rows": 20, "style": "width: 100%"}}}


def setup_admin(app):
    auth_backend = AdminAuth(secret_key=settings.supabase_jwt_secret)
    admin = Admin(app, engine, authentication_backend=auth_backend, templates_dir="templates")
    admin.add_view(BlogAdmin)
