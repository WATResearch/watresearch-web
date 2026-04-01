from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_publishable_key: str
    supabase_secret_key: str
    supabase_jwt_secret: str
    database_url: str
    admin_username: str
    admin_password: str
    cors_origins: str = ""

    model_config = {"env_file": ".env"}


settings = Settings()
