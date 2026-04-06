"""User profile and admin role management."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.task import Submission
from app.models.user import User
from app.schemas.task import SubmissionOut
from app.schemas.user import AdminRoleUpdate, UserProfile, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me/submissions", response_model=list[SubmissionOut])
async def my_submissions(
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[Submission]:
    result = await db.execute(
        select(Submission)
        .where(Submission.user_id == current.id)
        .order_by(Submission.submitted_at.desc())
    )
    return list(result.scalars().all())


@router.patch("/me", response_model=UserProfile)
async def update_me(
    body: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> User:
    if body.full_name is not None:
        current.full_name = body.full_name
    await db.flush()
    await db.refresh(current)
    return current


@router.patch("/{user_id}/role", response_model=UserProfile)
async def set_user_role(
    user_id: uuid.UUID,
    body: AdminRoleUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.role = body.role
    await db.flush()
    await db.refresh(user)
    return user
