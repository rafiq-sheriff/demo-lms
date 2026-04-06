"""Time slots and bookings."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import BookingStatus


class TimeSlot(Base):
    __tablename__ = "time_slots"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="time_slot")


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (UniqueConstraint("user_id", "time_slot_id", name="uq_booking_user_slot"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    time_slot_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("time_slots.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="booking_status", native_enum=False, length=32),
        default=BookingStatus.pending,
        nullable=False,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="bookings")
    time_slot: Mapped["TimeSlot"] = relationship("TimeSlot", back_populates="bookings")
