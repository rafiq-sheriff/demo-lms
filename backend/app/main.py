"""FastAPI application entrypoint."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.db.bootstrap import ensure_schema
from app.db.session import engine

settings = get_settings()

_UPLOADS_ROOT = Path(__file__).resolve().parent.parent / "uploads"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Import models so SQLAlchemy registers all mappers (and for Alembic autogenerate).
    import app.models  # noqa: F401

    _UPLOADS_ROOT.mkdir(parents=True, exist_ok=True)
    (_UPLOADS_ROOT / "covers").mkdir(parents=True, exist_ok=True)

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

# StaticFiles requires the directory to exist at import time (lifespan runs later).
_UPLOADS_ROOT.mkdir(parents=True, exist_ok=True)
(_UPLOADS_ROOT / "covers").mkdir(parents=True, exist_ok=True)
app.mount("/files", StaticFiles(directory=str(_UPLOADS_ROOT)), name="files")


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
