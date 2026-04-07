"""FAQ endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.faq import FAQ
from app.models.user import User
from app.schemas.faq import FAQCreate, FAQOut, FAQUpdate

router = APIRouter(prefix="/faqs", tags=["faqs"])


@router.post("", response_model=FAQOut, status_code=status.HTTP_201_CREATED)
async def create_faq(
    body: FAQCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_admin),
) -> FAQ:
    row = FAQ(
        question=body.question,
        answer=body.answer,
        is_published=body.is_published,
        sort_order=body.sort_order,
        created_by=current.id,
    )
    db.add(row)
    await db.flush()
    await db.refresh(row)
    return row


@router.get("", response_model=list[FAQOut])
async def list_faqs(
    db: AsyncSession = Depends(get_db),
    include_unpublished: bool = Query(default=False),
) -> list[FAQ]:
    q = select(FAQ).order_by(FAQ.sort_order.asc(), FAQ.created_at.desc())
    if not include_unpublished:
        q = q.where(FAQ.is_published.is_(True))
    result = await db.execute(q)
    return list(result.scalars().all())


@router.patch("/{faq_id}", response_model=FAQOut)
async def update_faq(
    faq_id: uuid.UUID,
    body: FAQUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> FAQ:
    row = await db.get(FAQ, faq_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ not found")
    if body.question is not None:
        row.question = body.question
    if body.answer is not None:
        row.answer = body.answer
    if body.is_published is not None:
        row.is_published = body.is_published
    if body.sort_order is not None:
        row.sort_order = body.sort_order
    await db.flush()
    await db.refresh(row)
    return row
