"""
One-off migration: add courses.is_free for existing databases (no Alembic in this repo).

Run from backend/:  python -m scripts.migrate_add_is_free
"""

import asyncio
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from sqlalchemy import text

from app.db.session import engine


async def main() -> None:
    async with engine.begin() as conn:
        await conn.execute(
            text(
                "ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT false"
            )
        )
    print("Migration OK: courses.is_free")


if __name__ == "__main__":
    asyncio.run(main())
