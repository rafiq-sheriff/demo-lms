"""Application configuration (env-driven)."""

from functools import lru_cache
from typing import Self
from urllib.parse import quote_plus

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str | None = Field(
        default=None,
        description=(
            "Full async URL for asyncpg, or omit and set SUPABASE_DB_HOST + SUPABASE_DB_PASSWORD "
            "(host from Cursor Supabase MCP: list_projects / get_project → database.host)."
        ),
    )
    supabase_db_host: str | None = Field(
        default=None,
        description="Supabase Postgres host (e.g. db.xxxxx.supabase.co from MCP get_project).",
    )
    supabase_db_user: str = Field(default="postgres")
    supabase_db_password: str | None = Field(default=None, repr=False)
    supabase_db_port: int = Field(default=5432, ge=1, le=65535)
    supabase_db_name: str = Field(default="postgres")

    database_ssl: bool = Field(
        default=True,
        description="Pass ssl=True to asyncpg (required for Supabase; disable for local dev without TLS).",
    )
    db_pool_size: int = Field(default=5, ge=1, le=50)
    db_max_overflow: int = Field(default=10, ge=0, le=50)
    db_pool_timeout: int = Field(default=30, ge=5, le=120)
    db_pool_recycle: int = Field(
        default=1800,
        ge=0,
        description="Recycle connections after N seconds (helps with Supabase pooler idle limits). 0 = disabled.",
    )

    jwt_secret_key: str = Field(..., min_length=16)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: str = "http://localhost:3000"
    debug: bool = False

    @model_validator(mode="after")
    def build_database_url_from_supabase_env(self) -> Self:
        if self.database_url:
            return self
        if self.supabase_db_host and self.supabase_db_password:
            u = quote_plus(self.supabase_db_user)
            p = quote_plus(self.supabase_db_password)
            self.database_url = (
                f"postgresql+asyncpg://{u}:{p}@{self.supabase_db_host}:"
                f"{self.supabase_db_port}/{self.supabase_db_name}"
            )
            return self
        raise ValueError(
            "Set DATABASE_URL, or both SUPABASE_DB_HOST and SUPABASE_DB_PASSWORD "
            "(use MCP list_projects / get_project for host; password from Supabase Dashboard → Database)."
        )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def async_database_url(self) -> str:
        """SQLAlchemy async URL using the asyncpg driver."""
        if not self.database_url:
            raise ValueError(
                "Set DATABASE_URL, or SUPABASE_DB_HOST and SUPABASE_DB_PASSWORD "
                "(host from Supabase MCP; password from Dashboard → Database)."
            )
        url = self.database_url.strip()
        if url.startswith("postgres://"):
            url = "postgresql+asyncpg://" + url[len("postgres://") :]
        elif url.startswith("postgresql://"):
            url = "postgresql+asyncpg://" + url[len("postgresql://") :]
        if not url.startswith("postgresql+asyncpg://"):
            raise ValueError(
                "DATABASE_URL must use asyncpg, e.g. postgresql+asyncpg://user:pass@host:5432/postgres"
            )
        return url

    @field_validator("database_url", mode="before")
    @classmethod
    def strip_database_url(cls, v: object) -> object:
        if v is None:
            return None
        if isinstance(v, str):
            s = v.strip()
            return s if s else None
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
