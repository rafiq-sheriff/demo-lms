"""Task and submission schemas."""

import uuid
from datetime import datetime

from pydantic import Field

from app.models.enums import SubmissionStatus
from app.schemas.common import ORMModel


class TaskCreate(ORMModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    course_id: uuid.UUID | None = None
    lesson_id: uuid.UUID | None = None
    due_at: datetime | None = None


class TaskOut(ORMModel):
    id: uuid.UUID
    course_id: uuid.UUID | None
    lesson_id: uuid.UUID | None
    title: str
    description: str | None
    due_at: datetime | None
    created_by: uuid.UUID | None
    created_at: datetime


class SubmissionCreate(ORMModel):
    file_url: str | None = Field(default=None, max_length=2048)
    link_url: str | None = Field(default=None, max_length=2048)


class SubmissionReview(ORMModel):
    score: int | None = Field(default=None, ge=0, le=100)
    feedback: str | None = None
    status: SubmissionStatus = SubmissionStatus.reviewed


class SubmissionOut(ORMModel):
    id: uuid.UUID
    task_id: uuid.UUID
    user_id: uuid.UUID
    file_url: str | None
    link_url: str | None
    submitted_at: datetime
    status: SubmissionStatus
    score: int | None
    feedback: str | None
    reviewed_by: uuid.UUID | None
    reviewed_at: datetime | None
