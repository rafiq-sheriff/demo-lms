"""FAQ schemas."""

import uuid
from datetime import datetime

from pydantic import Field

from app.schemas.common import ORMModel


class FAQCreate(ORMModel):
    question: str = Field(min_length=1, max_length=255)
    answer: str = Field(min_length=1)
    is_published: bool = True
    sort_order: int = 0


class FAQUpdate(ORMModel):
    question: str | None = Field(default=None, min_length=1, max_length=255)
    answer: str | None = None
    is_published: bool | None = None
    sort_order: int | None = None


class FAQOut(ORMModel):
    id: uuid.UUID
    question: str
    answer: str
    is_published: bool
    sort_order: int
    created_by: uuid.UUID | None
    created_at: datetime
