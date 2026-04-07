"""Batch schemas."""

import uuid
from datetime import datetime

from pydantic import Field, model_validator

from app.models.enums import BatchStatus
from app.schemas.common import ORMModel


class BatchCreate(ORMModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    starts_at: datetime
    ends_at: datetime
    status: BatchStatus | None = None

    @model_validator(mode="after")
    def validate_dates(self) -> "BatchCreate":
        if self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        return self


class BatchUpdate(ORMModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    status: BatchStatus | None = None


class BatchOut(ORMModel):
    id: uuid.UUID
    title: str
    description: str | None
    starts_at: datetime
    ends_at: datetime
    status: BatchStatus
    created_by: uuid.UUID | None
    created_at: datetime
