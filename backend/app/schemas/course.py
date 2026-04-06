"""Course, module, lesson, progress schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import Field

from app.schemas.common import ORMModel


class CourseCreate(ORMModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    is_free: bool = False


class CourseOut(ORMModel):
    id: uuid.UUID
    title: str
    description: str | None
    is_free: bool
    instructor_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    lesson_count: int = 0


class CourseDetail(CourseOut):
    modules: list["ModuleOut"] = Field(default_factory=list)


class ModuleCreate(ORMModel):
    title: str = Field(min_length=1, max_length=255)
    order_index: int = 0


class ModuleOut(ORMModel):
    id: uuid.UUID
    course_id: uuid.UUID
    title: str
    order_index: int
    created_at: datetime
    lessons: list["LessonOut"] = Field(default_factory=list)


class LessonCreate(ORMModel):
    title: str = Field(min_length=1, max_length=255)
    content: str | None = None
    order_index: int = 0
    duration_minutes: int | None = None


class LessonOut(ORMModel):
    id: uuid.UUID
    module_id: uuid.UUID
    title: str
    content: str | None
    order_index: int
    duration_minutes: int | None
    created_at: datetime


class ProgressUpsert(ORMModel):
    progress_percent: int = Field(ge=0, le=100)
    mark_complete: bool = False


class ProgressOut(ORMModel):
    id: uuid.UUID
    user_id: uuid.UUID
    lesson_id: uuid.UUID
    progress_percent: int
    completed_at: datetime | None
    updated_at: datetime


class EnrollmentOut(ORMModel):
    id: uuid.UUID
    user_id: uuid.UUID
    course_id: uuid.UUID
    enrolled_at: datetime
