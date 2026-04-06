"""
Create database tables (development bootstrap).
Prefer Alembic in production.
"""

import asyncio
import os
import sys

# Add backend root to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

# Import Base and engine
from app.db.base import Base
from app.db.session import engine

# Import all models so tables get registered
import app.models  # IMPORTANT


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


def main():
    print("Creating database tables...")
    asyncio.run(init_db())
    print("Tables created successfully.")


if __name__ == "__main__":
    main()