"""Lesson progress tracking."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.course import Enrollment, Lesson, Module, Progress
from app.models.user import User
from app.schemas.common import clamp_percent
from app.schemas.course import ProgressOut, ProgressUpsert

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.post("/{lesson_id}/progress", response_model=ProgressOut)
async def upsert_progress(
    lesson_id: uuid.UUID,
    body: ProgressUpsert,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Progress:
    lesson_result = await db.execute(
        select(Lesson.id).where(Lesson.id == lesson_id)
    )
    if lesson_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    enrollment_result = await db.execute(
        select(Enrollment.id)
        .join(Module, Module.course_id == Enrollment.course_id)
        .join(Lesson, Lesson.module_id == Module.id)
        .where(
            Enrollment.user_id == current.id,
            Lesson.id == lesson_id,
        )
    )
    if enrollment_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enrolled in this course")

    pct = clamp_percent(body.progress_percent)
    completed_at: datetime | None = None
    if body.mark_complete or pct >= 100:
        pct = 100
        completed_at = datetime.now(UTC)

    result = await db.execute(
        select(Progress).where(
            Progress.user_id == current.id,
            Progress.lesson_id == lesson_id,
        )
    )
    row = result.scalar_one_or_none()
    if row is None:
        row = Progress(
            user_id=current.id,
            lesson_id=lesson_id,
            progress_percent=pct,
            completed_at=completed_at,
        )
        db.add(row)
    else:
        row.progress_percent = pct
        if completed_at is not None:
            row.completed_at = completed_at

    await db.flush()
    await db.refresh(row)
    return row
