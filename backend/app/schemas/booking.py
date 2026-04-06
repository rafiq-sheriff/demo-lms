"""Time slot and booking schemas."""

import uuid
from datetime import datetime

from pydantic import Field

from app.models.enums import BookingStatus
from app.schemas.common import ORMModel


class TimeSlotCreate(ORMModel):
    start_at: datetime
    end_at: datetime
    capacity: int = Field(ge=1, le=1000)


class TimeSlotOut(ORMModel):
    id: uuid.UUID
    start_at: datetime
    end_at: datetime
    capacity: int
    created_by: uuid.UUID | None
    created_at: datetime


class BookingCreate(ORMModel):
    time_slot_id: uuid.UUID
    notes: str | None = None


class BookingOut(ORMModel):
    id: uuid.UUID
    user_id: uuid.UUID
    time_slot_id: uuid.UUID
    status: BookingStatus
    notes: str | None
    created_at: datetime
