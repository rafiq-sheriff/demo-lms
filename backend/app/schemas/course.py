"""Course, module, lesson, progress schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import Field, field_validator, model_validator

from app.utils.youtube import extract_youtube_id

from app.schemas.common import ORMModel


class CourseCreate(ORMModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    youtube_url: str = Field(min_length=1, max_length=512)
    is_free: bool = False
    price: Decimal | None = None
    image_url: str | None = Field(default=None, max_length=2048)

    @field_validator("youtube_url")
    @classmethod
    def validate_youtube(cls, v: str) -> str:
        s = v.strip()
        if extract_youtube_id(s) is None:
            raise ValueError("Enter a valid YouTube video URL")
        return s

    @model_validator(mode="after")
    def validate_price(self) -> CourseCreate:
        if self.is_free:
            object.__setattr__(self, "price", None)
        else:
            if self.price is None or self.price <= 0:
                raise ValueError("Paid courses require a price greater than 0")
        return self


class CourseUpdate(ORMModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    is_free: bool | None = None
    price: Decimal | None = None
    youtube_url: str | None = Field(default=None, max_length=512)
    image_url: str | None = Field(default=None, max_length=2048)

    @field_validator("youtube_url")
    @classmethod
    def validate_youtube_opt(cls, v: str | None) -> str | None:
        if v is None:
            return None
        s = v.strip()
        if not s:
            return None
        if extract_youtube_id(s) is None:
            raise ValueError("Enter a valid YouTube video URL")
        return s

    @model_validator(mode="after")
    def validate_price(self) -> CourseUpdate:
        if self.is_free is True:
            object.__setattr__(self, "price", None)
        return self


class CourseOut(ORMModel):
    id: uuid.UUID
    title: str
    description: str | None
    is_free: bool
    price: Decimal | None = None
    youtube_url: str | None = None
    image_url: str | None = None
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


class CourseProgressSummaryOut(ORMModel):
    course_id: uuid.UUID
    total_lessons: int
    completed_lessons: int
    progress_percent: int
