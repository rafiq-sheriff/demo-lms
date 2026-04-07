"""Tasks, submissions, reviews."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.course import Course, Enrollment, Lesson, Module
from app.models.enums import SubmissionStatus
from app.models.task import Submission, Task
from app.models.user import User
from app.schemas.task import (
    SubmissionCreate,
    SubmissionOut,
    SubmissionReview,
    SubmissionWithUserOut,
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


@router.get("/submissions", response_model=list[SubmissionWithUserOut])
async def list_all_submissions(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[SubmissionWithUserOut]:
    result = await db.execute(
        select(Submission, User)
        .select_from(Submission)
        .join(User, Submission.user_id == User.id)
        .order_by(Submission.submitted_at.desc())
        .limit(500)
    )
    out: list[SubmissionWithUserOut] = []
    for sub, usr in result.all():
        out.append(
            SubmissionWithUserOut(
                id=sub.id,
                task_id=sub.task_id,
                user_id=sub.user_id,
                user_email=usr.email,
                user_full_name=usr.full_name,
                file_url=sub.file_url,
                link_url=sub.link_url,
                submitted_at=sub.submitted_at,
                status=sub.status,
                score=sub.score,
                feedback=sub.feedback,
                reviewed_by=sub.reviewed_by,
                reviewed_at=sub.reviewed_at,
            )
        )
    return out


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
    target_course_id = task.course_id
    if target_course_id is None and task.lesson_id is not None:
        lesson_with_module = await db.execute(
            select(Lesson, Module).join(Module, Lesson.module_id == Module.id).where(Lesson.id == task.lesson_id)
        )
        row = lesson_with_module.one_or_none()
        if row is not None:
            target_course_id = row[1].course_id
    if target_course_id is not None:
        enrollment = await db.execute(
            select(Enrollment).where(
                Enrollment.user_id == current.id,
                Enrollment.course_id == target_course_id,
            )
        )
        if enrollment.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Enroll in the course before submitting this task",
            )

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
