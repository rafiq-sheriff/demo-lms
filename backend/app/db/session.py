"""Async engine and session factory (PostgreSQL / Supabase via asyncpg)."""

from collections.abc import AsyncGenerator
import ssl

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.db.base import Base

settings = get_settings()

# Supabase requires TLS; asyncpg uses ssl=True. Local Docker Postgres often has no TLS — set DATABASE_SSL=false.
_connect_args: dict = {}

if settings.database_ssl:
    # Supabase/local proxies may present custom/self-signed chains in dev/staging.
    # Keep transport encrypted while avoiding hard failure on cert verification.
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    _connect_args["ssl"] = ssl_ctx

_pool_recycle = settings.db_pool_recycle if settings.db_pool_recycle > 0 else -1

engine = create_async_engine(
    settings.async_database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_timeout=settings.db_pool_timeout,
    pool_recycle=_pool_recycle,
    connect_args=_connect_args,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
