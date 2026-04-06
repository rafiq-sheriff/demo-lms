"""Tasks and submissions."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import SubmissionStatus


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    course_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=True
    )
    lesson_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    course: Mapped["Course | None"] = relationship("Course", back_populates="tasks")
    lesson: Mapped["Lesson | None"] = relationship("Lesson", back_populates="tasks")
    submissions: Mapped[list["Submission"]] = relationship(
        "Submission", back_populates="task", cascade="all, delete-orphan"
    )


class Submission(Base):
    __tablename__ = "submissions"
    __table_args__ = (UniqueConstraint("task_id", "user_id", name="uq_submission_task_user"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    file_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    link_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    status: Mapped[SubmissionStatus] = mapped_column(
        Enum(SubmissionStatus, name="submission_status", native_enum=False, length=32),
        default=SubmissionStatus.pending,
        nullable=False,
    )
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    task: Mapped["Task"] = relationship("Task", back_populates="submissions")
    # Two FKs to users.id — must disambiguate for SQLAlchemy
    user: Mapped["User"] = relationship(
        "User",
        back_populates="submissions",
        foreign_keys=[user_id],
    )
    reviewer: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[reviewed_by],
        viewonly=True,
    )
