"""Courses, modules, lessons, enrollments."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.course import Course, Enrollment, Lesson, Module, Progress
from app.models.user import User
from app.schemas.course import (
    CourseCreate,
    CourseDetail,
    CourseOut,
    EnrollmentOut,
    LessonCreate,
    LessonOut,
    ModuleCreate,
    ModuleOut,
    ProgressOut,
)

router = APIRouter(prefix="/courses", tags=["courses"])


def _course_to_out(course: Course, *, lesson_count: int | None = None) -> CourseOut:
    if lesson_count is None:
        lesson_count = sum(len(m.lessons) for m in course.modules)
    return CourseOut(
        id=course.id,
        title=course.title,
        description=course.description,
        is_free=course.is_free,
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
    )
    db.add(course)
    await db.flush()
    await db.refresh(course)
    return _course_to_out(course, lesson_count=0)


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
    await db.flush()
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
