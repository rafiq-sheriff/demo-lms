"""FastAPI application entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.db.bootstrap import ensure_schema
from app.db.session import engine

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Import models so SQLAlchemy registers all mappers (and for Alembic autogenerate).
    import app.models  # noqa: F401

    await ensure_schema(engine)

    yield


app = FastAPI(
    title="LMS API",
    description="Learning management system backend (FastAPI + async SQLAlchemy + PostgreSQL).",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
