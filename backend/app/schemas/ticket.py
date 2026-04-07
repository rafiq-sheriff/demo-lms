"""Ticket and message schemas."""

import uuid
from datetime import datetime

from pydantic import Field

from app.models.enums import TicketStatus
from app.schemas.common import ORMModel


class TicketCreate(ORMModel):
    subject: str = Field(min_length=1, max_length=255)
    initial_message: str = Field(min_length=1)


class TicketOut(ORMModel):
    id: uuid.UUID
    user_id: uuid.UUID
    subject: str
    status: TicketStatus
    created_at: datetime
    closed_at: datetime | None
    student_email: str | None = None
    student_full_name: str | None = None


class MessageCreate(ORMModel):
    body: str = Field(min_length=1)


class MessageOut(ORMModel):
    id: uuid.UUID
    ticket_id: uuid.UUID
    user_id: uuid.UUID
    body: str
    created_at: datetime


class TicketDetail(TicketOut):
    messages: list[MessageOut] = Field(default_factory=list)
