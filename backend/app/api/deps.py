"""FastAPI dependencies: DB session, auth, RBAC."""

import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_token(credentials.credentials)
        user_id = uuid.UUID(str(payload["sub"]))
    except (ValueError, KeyError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from e

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive or not found")
    return user


def require_admin(current: User = Depends(get_current_user)) -> User:
    if current.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return current
