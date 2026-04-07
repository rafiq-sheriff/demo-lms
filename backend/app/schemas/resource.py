"""Resource schemas."""

import uuid
from datetime import datetime

from pydantic import Field

from app.schemas.common import ORMModel


class ResourceCreate(ORMModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    file_url: str | None = Field(default=None, max_length=2048)
    external_url: str | None = Field(default=None, max_length=2048)
    course_id: uuid.UUID | None = None
    lesson_id: uuid.UUID | None = None


class ResourceUpdate(ORMModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    file_url: str | None = Field(default=None, max_length=2048)
    external_url: str | None = Field(default=None, max_length=2048)
    course_id: uuid.UUID | None = None
    lesson_id: uuid.UUID | None = None


class ResourceOut(ORMModel):
    id: uuid.UUID
    title: str
    description: str | None
    file_url: str | None
    external_url: str | None
    course_id: uuid.UUID | None
    lesson_id: uuid.UUID | None
    created_by: uuid.UUID | None
    created_at: datetime
