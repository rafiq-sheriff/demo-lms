"""Time slots and appointment bookings."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.booking import Booking, TimeSlot
from app.models.enums import BookingStatus, UserRole
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingOut, TimeSlotCreate, TimeSlotOut

time_router = APIRouter(prefix="/time-slots", tags=["bookings"])
booking_router = APIRouter(prefix="/bookings", tags=["bookings"])


@time_router.post("", response_model=TimeSlotOut, status_code=status.HTTP_201_CREATED)
async def create_time_slot(
    body: TimeSlotCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> TimeSlot:
    if current.role not in (UserRole.admin, UserRole.mentor):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or mentor only")
    if body.end_at <= body.start_at:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="end_at must be after start_at")
    mentor_id = body.mentor_id
    if mentor_id is not None:
        mentor_user = await db.get(User, mentor_id)
        if mentor_user is None or mentor_user.role != UserRole.mentor:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="mentor_id must be a mentor user")
    elif current.role == UserRole.mentor:
        mentor_id = current.id
    slot = TimeSlot(
        start_at=body.start_at,
        end_at=body.end_at,
        capacity=body.capacity,
        created_by=current.id,
        mentor_id=mentor_id,
    )
    db.add(slot)
    await db.flush()
    await db.refresh(slot)
    return slot


@time_router.get("", response_model=list[TimeSlotOut])
async def list_time_slots(db: AsyncSession = Depends(get_db)) -> list[TimeSlot]:
    result = await db.execute(select(TimeSlot).order_by(TimeSlot.start_at.asc()))
    return list(result.scalars().all())


async def _count_active_bookings(db: AsyncSession, slot_id: uuid.UUID) -> int:
    result = await db.execute(
        select(func.count(Booking.id)).where(
            Booking.time_slot_id == slot_id,
            Booking.status.in_((BookingStatus.pending, BookingStatus.confirmed, BookingStatus.completed)),
        )
    )
    return int(result.scalar_one() or 0)


@booking_router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(
    body: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Booking:
    slot = await db.get(TimeSlot, body.time_slot_id)
    if slot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Time slot not found")
    used = await _count_active_bookings(db, slot.id)
    if used >= slot.capacity:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slot is full")
    existing = await db.execute(
        select(Booking).where(
            Booking.user_id == current.id,
            Booking.time_slot_id == body.time_slot_id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already booked this slot")
    row = Booking(
        user_id=current.id,
        time_slot_id=body.time_slot_id,
        status=BookingStatus.confirmed,
        notes=body.notes,
    )
    db.add(row)
    await db.flush()
    await db.refresh(row)
    return row


@booking_router.get("", response_model=list[BookingOut])
async def list_bookings(
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
    user_id: uuid.UUID | None = Query(default=None),
) -> list[Booking]:
    q = select(Booking).order_by(Booking.created_at.desc())
    if current.role != UserRole.admin:
        q = q.where(Booking.user_id == current.id)
    elif user_id is not None:
        q = q.where(Booking.user_id == user_id)
    result = await db.execute(q)
    return list(result.scalars().all())
