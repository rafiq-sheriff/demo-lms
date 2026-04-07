"""Ensure tables/columns exist safely for dev/demo environments."""

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncEngine

from app.db.base import Base

def _ensure_course_columns_sync(connection) -> None:
    try:
        tables = inspect(connection).get_table_names()
    except Exception:
        return
    if "courses" not in tables:
        return

    dialect = connection.dialect.name

    def names() -> set[str]:
        try:
            return {c["name"] for c in inspect(connection).get_columns("courses")}
        except Exception:
            return set()

    n = names()
    if "is_free" not in n:
        if dialect == "sqlite":
            connection.execute(
                text("ALTER TABLE courses ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT 0")
            )
        else:
            connection.execute(
                text("ALTER TABLE courses ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT false")
            )

    n = names()
    if "price" not in n:
        connection.execute(text("ALTER TABLE courses ADD COLUMN price NUMERIC(12,2)"))

    n = names()
    if "youtube_url" not in n:
        if dialect == "sqlite":
            connection.execute(text("ALTER TABLE courses ADD COLUMN youtube_url TEXT"))
        else:
            connection.execute(text("ALTER TABLE courses ADD COLUMN youtube_url VARCHAR(512)"))

    n = names()
    if "image_url" not in n:
        if dialect == "sqlite":
            connection.execute(text("ALTER TABLE courses ADD COLUMN image_url TEXT"))
        else:
            connection.execute(text("ALTER TABLE courses ADD COLUMN image_url VARCHAR(2048)"))


def _ensure_booking_columns_sync(connection) -> None:
    try:
        tables = inspect(connection).get_table_names()
    except Exception:
        return
    if "time_slots" not in tables:
        return
    try:
        names = {c["name"] for c in inspect(connection).get_columns("time_slots")}
    except Exception:
        return
    if "mentor_id" not in names:
        if connection.dialect.name == "sqlite":
            connection.execute(text("ALTER TABLE time_slots ADD COLUMN mentor_id TEXT"))
        else:
            connection.execute(text("ALTER TABLE time_slots ADD COLUMN mentor_id UUID"))


async def ensure_schema(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(_ensure_course_columns_sync)
        await conn.run_sync(_ensure_booking_columns_sync)
