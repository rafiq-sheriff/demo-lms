"""Ensure expected columns exist (dev/demo; no Alembic in this repo)."""

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncEngine


def _ensure_is_free_on_courses_sync(connection) -> None:
    insp = inspect(connection)
    try:
        tables = insp.get_table_names()
    except Exception:
        return
    if "courses" not in tables:
        return
    try:
        names = {c["name"] for c in insp.get_columns("courses")}
    except Exception:
        return
    if "is_free" in names:
        return
    dialect = connection.dialect.name
    if dialect == "sqlite":
        connection.execute(text("ALTER TABLE courses ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT 0"))
    else:
        connection.execute(
            text("ALTER TABLE courses ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT false")
        )


async def ensure_schema(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(_ensure_is_free_on_courses_sync)
