"""In-app notification endpoints."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationCreate, NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("", response_model=NotificationOut, status_code=status.HTTP_201_CREATED)
async def create_notification(
    body: NotificationCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> Notification:
    row = Notification(
        user_id=body.user_id,
        title=body.title,
        body=body.body,
        notification_type=body.notification_type,
    )
    db.add(row)
    await db.flush()
    await db.refresh(row)
    return row


@router.get("/me", response_model=list[NotificationOut])
async def my_notifications(
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[Notification]:
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current.id)
        .order_by(Notification.created_at.desc())
        .limit(200)
    )
    return list(result.scalars().all())


@router.post("/{notification_id}/read", response_model=NotificationOut)
async def mark_notification_read(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Notification:
    row = await db.get(Notification, notification_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    if row.user_id != current.id and current.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    row.is_read = True
    row.read_at = datetime.now(UTC)
    await db.flush()
    await db.refresh(row)
    return row
