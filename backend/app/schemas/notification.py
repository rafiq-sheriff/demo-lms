"""Notification schemas."""

import uuid
from datetime import datetime

from pydantic import Field

from app.models.enums import NotificationType
from app.schemas.common import ORMModel


class NotificationCreate(ORMModel):
    user_id: uuid.UUID
    title: str = Field(min_length=1, max_length=255)
    body: str | None = None
    notification_type: NotificationType = NotificationType.system


class NotificationOut(ORMModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    body: str | None
    notification_type: NotificationType
    is_read: bool
    read_at: datetime | None
    created_at: datetime
