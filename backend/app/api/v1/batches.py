"""Batch endpoints."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.batch import Batch
from app.models.enums import BatchStatus
from app.models.user import User
from app.schemas.batch import BatchCreate, BatchOut, BatchUpdate

router = APIRouter(prefix="/batches", tags=["batches"])


def _derive_status(starts_at: datetime, ends_at: datetime) -> BatchStatus:
    now = datetime.now(UTC)
    if ends_at < now:
        return BatchStatus.completed
    if starts_at <= now <= ends_at:
        return BatchStatus.live
    return BatchStatus.upcoming


@router.post("", response_model=BatchOut, status_code=status.HTTP_201_CREATED)
async def create_batch(
    body: BatchCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_admin),
) -> Batch:
    row = Batch(
        title=body.title,
        description=body.description,
        starts_at=body.starts_at,
        ends_at=body.ends_at,
        status=body.status or _derive_status(body.starts_at, body.ends_at),
        created_by=current.id,
    )
    db.add(row)
    await db.flush()
    await db.refresh(row)
    return row


@router.get("", response_model=list[BatchOut])
async def list_batches(
    db: AsyncSession = Depends(get_db),
    status_filter: BatchStatus | None = Query(default=None, alias="status"),
) -> list[Batch]:
    q = select(Batch).order_by(Batch.starts_at.asc())
    if status_filter is not None:
        q = q.where(Batch.status == status_filter)
    result = await db.execute(q)
    return list(result.scalars().all())


@router.patch("/{batch_id}", response_model=BatchOut)
async def update_batch(
    batch_id: uuid.UUID,
    body: BatchUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> Batch:
    row = await db.get(Batch, batch_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
    if body.title is not None:
        row.title = body.title
    if body.description is not None:
        row.description = body.description
    if body.starts_at is not None:
        row.starts_at = body.starts_at
    if body.ends_at is not None:
        row.ends_at = body.ends_at
    if row.ends_at <= row.starts_at:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="ends_at must be after starts_at")
    row.status = body.status or _derive_status(row.starts_at, row.ends_at)
    await db.flush()
    await db.refresh(row)
    return row
