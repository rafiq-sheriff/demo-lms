"""User model."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import UserRole


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", native_enum=False, length=32),
        default=UserRole.student,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    courses_instructed = relationship("Course", back_populates="instructor", foreign_keys="Course.instructor_id")
    enrollments = relationship("Enrollment", back_populates="user")
    progress_records = relationship("Progress", back_populates="user")
    submissions = relationship(
        "Submission",
        back_populates="user",
        foreign_keys="Submission.user_id",
    )
    tickets = relationship("Ticket", back_populates="user")
    messages = relationship("Message", back_populates="user")
    bookings = relationship("Booking", back_populates="user")
    applications = relationship("Application", back_populates="user")
