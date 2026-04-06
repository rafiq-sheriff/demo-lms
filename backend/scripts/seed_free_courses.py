"""
Seed 3 free demo courses with modules/lessons and YouTube links (data / analytics / ML).

Run from backend/:  python -m scripts.seed_free_courses

Requires: tables created (init_db), migration for is_free if upgrading an old DB.
Uses the first admin user as instructor; creates one if none exist (demo only).
"""

from __future__ import annotations

import asyncio
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import async_session_factory
from app.models.course import Course, Lesson, Module
from app.models.enums import UserRole
from app.models.user import User
from app.services.auth import create_user

# Public educational videos (data, SQL, Python, ML, stats) — embed-friendly ids.
YOUTUBE_IDS = [
    "HXV3zeQKqGY",  # SQL
    "rfscVS0vtbw",  # Python basics
    "RBSGKlAvoiM",  # ML intro
    "ua-CiDNNj30",  # Data science
    "8jPQjjsBbIc",  # Statistics
    "PPLop4L2eGk",  # ML course sample
    "aircAruvnKk",  # Neural networks (3B1B)
    "xk4_1vDrzzo",  # PyTorch
    "vmEHCJyBW8Y",  # Pandas
    "qBigTkBLVwA",  # StatQuest example
]

FREE_COURSES: list[dict] = [
    {
        "title": "SQL for Analytics — Free Starter",
        "description": "Query and filter data for reporting. Free enrollment; practice with real-world style examples.",
        "modules": [
            ("Getting started", ["Connecting to data", "SELECT and filters", "Aggregations"]),
            ("Going deeper", ["JOINs", "Subqueries", "Window intro"]),
        ],
    },
    {
        "title": "Python for Data Work — Free Starter",
        "description": "Python fundamentals oriented toward notebooks, data structures, and reading CSVs.",
        "modules": [
            ("Core Python", ["Syntax warm-up", "Lists and dicts", "Functions and files"]),
            ("Toward data", ["Virtual envs", "Intro to pandas mindset", "Next steps"]),
        ],
    },
    {
        "title": "Machine Learning Concepts — Free Starter",
        "description": "High-level ML workflow: data, training, evaluation — with curated video lessons.",
        "modules": [
            ("Foundations", ["What is ML?", "Train / test split", "Metrics overview"]),
            ("Neural nets intro", ["Representations", "Simple NN intuition", "What to learn next"]),
        ],
    },
]


def lesson_content(video_index: int) -> str:
    vid = YOUTUBE_IDS[video_index % len(YOUTUBE_IDS)]
    return f'<p>Video lesson: <a href="https://www.youtube.com/watch?v={vid}">watch</a></p><p>https://www.youtube.com/embed/{vid}</p>'


async def ensure_admin_instructor(db: AsyncSession) -> User:
    r = await db.execute(select(User).where(User.role == UserRole.admin).limit(1))
    u = r.scalar_one_or_none()
    if u:
        return u
    return await create_user(
        db,
        email="seed-admin@demo.analyticsavenue.local",
        password="SeedAdminChangeMe!",
        full_name="Seed Admin",
        role=UserRole.admin,
    )


async def already_seeded(db: AsyncSession) -> bool:
    wanted = {x["title"] for x in FREE_COURSES}
    r = await db.execute(select(Course).where(Course.title.in_(list(wanted))))
    found = {c.title for c in r.scalars().all()}
    return wanted <= found


async def seed() -> None:
    async with async_session_factory() as db:
        if await already_seeded(db):
            print("Seed skipped: free demo courses already present.")
            return

        instructor = await ensure_admin_instructor(db)
        video_i = 0

        for spec in FREE_COURSES:
            course = Course(
                title=spec["title"],
                description=spec["description"],
                instructor_id=instructor.id,
                is_free=True,
            )
            db.add(course)
            await db.flush()

            for mi, (mod_title, lesson_titles) in enumerate(spec["modules"]):
                mod = Module(
                    course_id=course.id,
                    title=mod_title,
                    order_index=mi,
                )
                db.add(mod)
                await db.flush()
                for li, lt in enumerate(lesson_titles):
                    db.add(
                        Lesson(
                            module_id=mod.id,
                            title=lt,
                            content=lesson_content(video_i),
                            order_index=li,
                            duration_minutes=15 + (video_i % 20),
                        )
                    )
                    video_i += 1

        await db.commit()
        print(f"Seeded {len(FREE_COURSES)} free courses with YouTube-backed lessons.")


def main() -> None:
    asyncio.run(seed())


if __name__ == "__main__":
    main()
