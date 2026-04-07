"""Courses, modules, lessons, enrollments."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.course import Course, Enrollment, Lesson, Module, Progress
from app.models.user import User
from app.schemas.course import (
    CourseProgressSummaryOut,
    CourseCreate,
    CourseDetail,
    CourseOut,
    CourseUpdate,
    EnrollmentOut,
    LessonCreate,
    LessonOut,
    ModuleCreate,
    ModuleOut,
    ProgressOut,
)
from app.utils.youtube import build_lesson_content_from_youtube_url

router = APIRouter(prefix="/courses", tags=["courses"])


async def _ensure_user_enrolled(
    db: AsyncSession,
    *,
    course_id: uuid.UUID,
    user_id: uuid.UUID,
) -> None:
    enrollment_row = await db.execute(
        select(Enrollment.id).where(
            Enrollment.course_id == course_id,
            Enrollment.user_id == user_id,
        )
    )
    if enrollment_row.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enrolled in this course")


def _course_to_out(course: Course, *, lesson_count: int | None = None) -> CourseOut:
    if lesson_count is None:
        lesson_count = sum(len(m.lessons) for m in course.modules)
    return CourseOut(
        id=course.id,
        title=course.title,
        description=course.description,
        is_free=course.is_free,
        price=course.price,
        youtube_url=course.youtube_url,
        image_url=course.image_url,
        instructor_id=course.instructor_id,
        created_at=course.created_at,
        updated_at=course.updated_at,
        lesson_count=lesson_count,
    )


@router.post("", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
async def create_course(
    body: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_admin),
) -> CourseOut:
    course = Course(
        title=body.title,
        description=body.description,
        instructor_id=current.id,
        is_free=body.is_free,
        price=None if body.is_free else body.price,
        youtube_url=body.youtube_url,
        image_url=body.image_url,
    )
    db.add(course)
    await db.flush()
    await db.refresh(course)

    mod = Module(course_id=course.id, title="Introduction", order_index=0)
    db.add(mod)
    await db.flush()
    lesson = Lesson(
        module_id=mod.id,
        title="Course intro",
        content=build_lesson_content_from_youtube_url(body.youtube_url),
        order_index=0,
        duration_minutes=None,
    )
    db.add(lesson)
    await db.flush()

    result = await db.execute(
        select(Course)
        .options(selectinload(Course.modules).selectinload(Module.lessons))
        .where(Course.id == course.id)
    )
    row = result.scalar_one()
    return _course_to_out(row)


@router.get("", response_model=list[CourseOut])
async def list_courses(db: AsyncSession = Depends(get_db)) -> list[CourseOut]:
    result = await db.execute(
        select(Course)
        .options(selectinload(Course.modules).selectinload(Module.lessons))
        .order_by(Course.created_at.desc())
    )
    courses = result.scalars().unique().all()
    return [_course_to_out(c) for c in courses]


@router.get("/mine", response_model=list[CourseOut])
async def my_enrolled_courses(
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[CourseOut]:
    result = await db.execute(
        select(Course)
        .options(selectinload(Course.modules).selectinload(Module.lessons))
        .join(Enrollment, Enrollment.course_id == Course.id)
        .where(Enrollment.user_id == current.id)
        .order_by(Enrollment.enrolled_at.desc())
    )
    courses = result.scalars().unique().all()
    return [_course_to_out(c) for c in courses]


@router.patch("/{course_id}", response_model=CourseOut)
async def update_course(
    course_id: uuid.UUID,
    body: CourseUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> CourseOut:
    c = await db.get(Course, course_id)
    if c is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if body.title is not None:
        c.title = body.title
    if body.description is not None:
        c.description = body.description
    if body.is_free is not None:
        c.is_free = body.is_free
    if body.price is not None:
        c.price = body.price
    if body.youtube_url is not None:
        c.youtube_url = body.youtube_url
    if body.image_url is not None:
        c.image_url = body.image_url
    if body.is_free is True:
        c.price = None
    await db.flush()
    await db.refresh(c)
    course = await db.execute(
        select(Course)
        .options(selectinload(Course.modules).selectinload(Module.lessons))
        .where(Course.id == course_id)
    )
    row = course.scalar_one()
    return _course_to_out(row)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> None:
    c = await db.get(Course, course_id)
    if c is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    await db.delete(c)
    await db.flush()


@router.get("/{course_id}", response_model=CourseDetail)
async def get_course(course_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> CourseDetail:
    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.modules).selectinload(Module.lessons),
        )
        .where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    detail = CourseDetail.model_validate(course)
    lesson_count = sum(len(m.lessons) for m in course.modules)
    return detail.model_copy(update={"lesson_count": lesson_count})


@router.get("/{course_id}/my-progress", response_model=list[ProgressOut])
async def my_progress_for_course(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[Progress]:
    c = await db.get(Course, course_id)
    if c is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    await _ensure_user_enrolled(db, course_id=course_id, user_id=current.id)

    lesson_rows = await db.execute(
        select(Lesson.id).join(Module).where(Module.course_id == course_id)
    )
    lesson_ids = [row[0] for row in lesson_rows.all()]
    if not lesson_ids:
        return []

    prog_result = await db.execute(
        select(Progress).where(
            Progress.user_id == current.id,
            Progress.lesson_id.in_(lesson_ids),
        )
    )
    return list(prog_result.scalars().all())


@router.get("/{course_id}/my-progress-summary", response_model=CourseProgressSummaryOut)
async def my_progress_summary_for_course(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> CourseProgressSummaryOut:
    c = await db.get(Course, course_id)
    if c is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    await _ensure_user_enrolled(db, course_id=course_id, user_id=current.id)

    lesson_rows = await db.execute(
        select(Lesson.id).join(Module).where(Module.course_id == course_id)
    )
    lesson_ids = [row[0] for row in lesson_rows.all()]
    total_lessons = len(lesson_ids)
    if total_lessons == 0:
        return CourseProgressSummaryOut(
            course_id=course_id,
            total_lessons=0,
            completed_lessons=0,
            progress_percent=0,
        )

    progress_rows = await db.execute(
        select(Progress.lesson_id, Progress.progress_percent).where(
            Progress.user_id == current.id,
            Progress.lesson_id.in_(lesson_ids),
        )
    )
    progress_by_lesson = {row[0]: int(row[1]) for row in progress_rows.all()}
    completed_lessons = sum(1 for lesson_id in lesson_ids if progress_by_lesson.get(lesson_id, 0) >= 100)
    progress_percent = round((completed_lessons * 100) / total_lessons)

    return CourseProgressSummaryOut(
        course_id=course_id,
        total_lessons=total_lessons,
        completed_lessons=completed_lessons,
        progress_percent=progress_percent,
    )


@router.post("/{course_id}/enroll", response_model=EnrollmentOut, status_code=status.HTTP_201_CREATED)
async def enroll(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Enrollment:
    c = await db.get(Course, course_id)
    if c is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    existing = await db.execute(
        select(Enrollment).where(
            Enrollment.user_id == current.id,
            Enrollment.course_id == course_id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already enrolled")
    row = Enrollment(user_id=current.id, course_id=course_id)
    db.add(row)
    try:
        await db.flush()
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already enrolled") from None
    await db.refresh(row)
    return row


@router.post("/{course_id}/modules", response_model=ModuleOut, status_code=status.HTTP_201_CREATED)
async def add_module(
    course_id: uuid.UUID,
    body: ModuleCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> Module:
    c = await db.get(Course, course_id)
    if c is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    mod = Module(course_id=course_id, title=body.title, order_index=body.order_index)
    db.add(mod)
    await db.flush()
    await db.refresh(mod)
    return mod


@router.post("/modules/{module_id}/lessons", response_model=LessonOut, status_code=status.HTTP_201_CREATED)
async def add_lesson(
    module_id: uuid.UUID,
    body: LessonCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> Lesson:
    m = await db.get(Module, module_id)
    if m is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    lesson = Lesson(
        module_id=module_id,
        title=body.title,
        content=body.content,
        order_index=body.order_index,
        duration_minutes=body.duration_minutes,
    )
    db.add(lesson)
    await db.flush()
    await db.refresh(lesson)
    return lesson
