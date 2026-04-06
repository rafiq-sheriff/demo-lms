"""Job and application schemas."""

import uuid
from datetime import datetime

from pydantic import Field

from app.models.enums import ApplicationStatus
from app.schemas.common import ORMModel


class JobCreate(ORMModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    company: str | None = Field(default=None, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    closes_at: datetime | None = None


class JobOut(ORMModel):
    id: uuid.UUID
    title: str
    description: str | None
    company: str | None
    location: str | None
    created_by: uuid.UUID | None
    closes_at: datetime | None
    created_at: datetime


class ApplicationCreate(ORMModel):
    cover_letter: str | None = None
    resume_url: str | None = Field(default=None, max_length=2048)


class ApplicationOut(ORMModel):
    id: uuid.UUID
    job_id: uuid.UUID
    user_id: uuid.UUID
    cover_letter: str | None
    resume_url: str | None
    status: ApplicationStatus
    applied_at: datetime
