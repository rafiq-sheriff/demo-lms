"""Basic chat support on top of ticket threads."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import TicketOut

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/threads", response_model=list[TicketOut])
async def list_chat_threads(
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[Ticket]:
    q = select(Ticket).order_by(Ticket.created_at.desc()).limit(200)
    if current.role != UserRole.admin:
        q = q.where(Ticket.user_id == current.id)
    result = await db.execute(q)
    return list(result.scalars().all())
