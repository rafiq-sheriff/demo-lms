"""Auth request/response schemas."""

import uuid

from pydantic import EmailStr, Field

from app.models.enums import UserRole
from app.schemas.common import ORMModel


class RegisterRequest(ORMModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)


class LoginRequest(ORMModel):
    email: EmailStr
    password: str


class TokenResponse(ORMModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(ORMModel):
    sub: str
    role: UserRole | None = None


class UserPublic(ORMModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
