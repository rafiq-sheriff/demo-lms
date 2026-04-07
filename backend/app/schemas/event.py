"""Event schemas."""

import uuid
from datetime import datetime

from pydantic import Field, model_validator

from app.models.enums import EventType
from app.schemas.common import ORMModel


class EventCreate(ORMModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    starts_at: datetime
    ends_at: datetime | None = None
    event_type: EventType = EventType.event
    course_id: uuid.UUID | None = None

    @model_validator(mode="after")
    def validate_dates(self) -> "EventCreate":
        if self.ends_at is not None and self.ends_at < self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        return self


class EventUpdate(ORMModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    event_type: EventType | None = None
    course_id: uuid.UUID | None = None


class EventOut(ORMModel):
    id: uuid.UUID
    title: str
    description: str | None
    starts_at: datetime
    ends_at: datetime | None
    event_type: EventType
    course_id: uuid.UUID | None
    created_by: uuid.UUID | None
    created_at: datetime
