"""Support tickets and threaded messages."""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.api.deps import get_current_user, require_student
from app.db.session import get_db
from app.models.enums import TicketStatus, UserRole
from app.models.ticket import Message, Ticket
from app.models.user import User
from app.schemas.ticket import MessageCreate, MessageOut, TicketCreate, TicketDetail, TicketOut

router = APIRouter(prefix="/tickets", tags=["tickets"])


def _ticket_to_out(ticket: Ticket, *, for_admin: bool) -> TicketOut:
    base = TicketOut.model_validate(ticket)
    if for_admin and ticket.user:
        return base.model_copy(
            update={
                "student_email": ticket.user.email,
                "student_full_name": ticket.user.full_name,
            }
        )
    return base


@router.post("", response_model=TicketDetail, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    body: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_student),
) -> Ticket:
    ticket = Ticket(user_id=current.id, subject=body.subject, status=TicketStatus.open)
    db.add(ticket)
    await db.flush()
    msg = Message(ticket_id=ticket.id, user_id=current.id, body=body.initial_message)
    db.add(msg)
    await db.flush()
    await db.refresh(ticket)
    result = await db.execute(
        select(Ticket)
        .options(selectinload(Ticket.messages))
        .where(Ticket.id == ticket.id)
    )
    return result.scalar_one()


@router.get("", response_model=list[TicketOut])
async def list_tickets(
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
    status_filter: TicketStatus | None = Query(default=None, alias="status"),
) -> list[TicketOut]:
    q = (
        select(Ticket)
        .options(joinedload(Ticket.user))
        .order_by(Ticket.created_at.desc())
    )
    if current.role != UserRole.admin:
        q = q.where(Ticket.user_id == current.id)
    if status_filter is not None:
        q = q.where(Ticket.status == status_filter)
    result = await db.execute(q)
    rows = result.unique().scalars().all()
    is_admin = current.role == UserRole.admin
    return [_ticket_to_out(t, for_admin=is_admin) for t in rows]


@router.get("/{ticket_id}", response_model=TicketDetail)
async def get_ticket(
    ticket_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Ticket:
    result = await db.execute(
        select(Ticket)
        .options(selectinload(Ticket.messages))
        .where(Ticket.id == ticket_id)
    )
    ticket = result.scalar_one_or_none()
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    if current.role != UserRole.admin and ticket.user_id != current.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return ticket


@router.post("/{ticket_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
async def add_message(
    ticket_id: uuid.UUID,
    body: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Message:
    ticket = await db.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    if current.role != UserRole.admin and ticket.user_id != current.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if ticket.status == TicketStatus.closed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ticket is closed")
    msg = Message(ticket_id=ticket_id, user_id=current.id, body=body.body)
    db.add(msg)
    await db.flush()
    await db.refresh(msg)
    return msg


@router.post("/{ticket_id}/close", response_model=TicketOut)
async def close_ticket(
    ticket_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Ticket:
    ticket = await db.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    if current.role != UserRole.admin and ticket.user_id != current.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    ticket.status = TicketStatus.closed
    ticket.closed_at = datetime.now(UTC)
    await db.flush()
    await db.refresh(ticket)
    return ticket
