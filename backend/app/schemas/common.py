"""Shared Pydantic configuration."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class IDMixin(BaseModel):
    id: uuid.UUID


class TimestampMixin(BaseModel):
    created_at: datetime


def clamp_percent(v: int) -> int:
    return max(0, min(100, v))
