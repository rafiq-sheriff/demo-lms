"""User schemas."""

import uuid

from pydantic import EmailStr, Field

from app.models.enums import UserRole
from app.schemas.common import ORMModel


class UserProfile(ORMModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool


class UserUpdate(ORMModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)


class AdminRoleUpdate(ORMModel):
    role: UserRole
