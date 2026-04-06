"""Tasks, submissions, reviews."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.course import Course, Lesson
from app.models.enums import SubmissionStatus
from app.models.task import Submission, Task
from app.models.user import User
from app.schemas.task import (
    SubmissionCreate,
    SubmissionOut,
    SubmissionReview,
    TaskCreate,
    TaskOut,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def create_task(
    body: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_admin),
) -> Task:
    if body.course_id:
        c = await db.get(Course, body.course_id)
        if c is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if body.lesson_id:
        l = await db.get(Lesson, body.lesson_id)
        if l is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    if not body.course_id and not body.lesson_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide course_id and/or lesson_id",
        )
    task = Task(
        course_id=body.course_id,
        lesson_id=body.lesson_id,
        title=body.title,
        description=body.description,
        due_at=body.due_at,
        created_by=current.id,
    )
    db.add(task)
    await db.flush()
    await db.refresh(task)
    return task


@router.get("", response_model=list[TaskOut])
async def list_tasks(
    db: AsyncSession = Depends(get_db),
    course_id: uuid.UUID | None = Query(default=None),
    lesson_id: uuid.UUID | None = Query(default=None),
) -> list[Task]:
    q = select(Task).order_by(Task.created_at.desc())
    if course_id is not None:
        q = q.where(Task.course_id == course_id)
    if lesson_id is not None:
        q = q.where(Task.lesson_id == lesson_id)
    result = await db.execute(q)
    return list(result.scalars().all())


@router.post("/{task_id}/submit", response_model=SubmissionOut, status_code=status.HTTP_201_CREATED)
async def submit_task(
    task_id: uuid.UUID,
    body: SubmissionCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Submission:
    if body.file_url is None and body.link_url is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide file_url and/or link_url",
        )
    task = await db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    result = await db.execute(
        select(Submission).where(Submission.task_id == task_id, Submission.user_id == current.id)
    )
    sub = result.scalar_one_or_none()
    if sub is None:
        sub = Submission(
            task_id=task_id,
            user_id=current.id,
            file_url=body.file_url,
            link_url=body.link_url,
            status=SubmissionStatus.pending,
        )
        db.add(sub)
    else:
        sub.file_url = body.file_url
        sub.link_url = body.link_url
        sub.submitted_at = datetime.now(UTC)
        sub.status = SubmissionStatus.pending
        sub.score = None
        sub.feedback = None
        sub.reviewed_by = None
        sub.reviewed_at = None

    await db.flush()
    await db.refresh(sub)
    return sub


@router.patch("/submissions/{submission_id}/review", response_model=SubmissionOut)
async def review_submission(
    submission_id: uuid.UUID,
    body: SubmissionReview,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_admin),
) -> Submission:
    sub = await db.get(Submission, submission_id)
    if sub is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    sub.status = body.status
    sub.score = body.score
    sub.feedback = body.feedback
    sub.reviewed_by = current.id
    sub.reviewed_at = datetime.now(UTC)
    await db.flush()
    await db.refresh(sub)
    return sub
