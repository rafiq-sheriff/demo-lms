"""Job update schemas."""

import uuid
from datetime import datetime

from pydantic import Field

from app.schemas.common import ORMModel


class JobUpdateCreate(ORMModel):
    title: str = Field(min_length=1, max_length=255)
    body: str | None = None


class JobUpdateOut(ORMModel):
    id: uuid.UUID
    job_id: uuid.UUID
    title: str
    body: str | None
    created_by: uuid.UUID | None
    created_at: datetime
