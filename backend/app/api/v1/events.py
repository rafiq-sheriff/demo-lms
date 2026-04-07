"""Calendar events endpoints."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.course import Course
from app.models.event import Event
from app.models.enums import EventType
from app.models.user import User
from app.schemas.event import EventCreate, EventOut, EventUpdate

router = APIRouter(prefix="/events", tags=["events"])


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
async def create_event(
    body: EventCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_admin),
) -> Event:
    if body.course_id is not None and await db.get(Course, body.course_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    row = Event(
        title=body.title,
        description=body.description,
        starts_at=body.starts_at,
        ends_at=body.ends_at,
        event_type=body.event_type,
        course_id=body.course_id,
        created_by=current.id,
    )
    db.add(row)
    await db.flush()
    await db.refresh(row)
    return row


@router.get("", response_model=list[EventOut])
async def list_events(
    db: AsyncSession = Depends(get_db),
    event_type: EventType | None = Query(default=None),
    from_date: datetime | None = Query(default=None),
    to_date: datetime | None = Query(default=None),
) -> list[Event]:
    q = select(Event).order_by(Event.starts_at.asc())
    if event_type is not None:
        q = q.where(Event.event_type == event_type)
    if from_date is not None:
        q = q.where(Event.starts_at >= from_date)
    if to_date is not None:
        q = q.where(Event.starts_at <= to_date)
    result = await db.execute(q)
    return list(result.scalars().all())


@router.patch("/{event_id}", response_model=EventOut)
async def update_event(
    event_id: uuid.UUID,
    body: EventUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> Event:
    row = await db.get(Event, event_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    if body.title is not None:
        row.title = body.title
    if body.description is not None:
        row.description = body.description
    if body.starts_at is not None:
        row.starts_at = body.starts_at
    if body.ends_at is not None:
        row.ends_at = body.ends_at
    if row.ends_at is not None and row.ends_at < row.starts_at:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="ends_at must be after starts_at")
    if body.event_type is not None:
        row.event_type = body.event_type
    if body.course_id is not None:
        if await db.get(Course, body.course_id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
        row.course_id = body.course_id
    await db.flush()
    await db.refresh(row)
    return row


@router.get("/upcoming", response_model=list[EventOut])
async def list_upcoming_events(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Event]:
    now = datetime.now(UTC)
    result = await db.execute(select(Event).where(Event.starts_at >= now).order_by(Event.starts_at.asc()).limit(50))
    return list(result.scalars().all())
