"""Register, login, current user."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserPublic
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)) -> User:
    existing = await auth_service.get_user_by_email(db, body.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = await auth_service.create_user(
        db,
        email=body.email,
        password=body.password,
        full_name=body.full_name,
    )
    return user


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user = await auth_service.verify_credentials(db, body.email, body.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(
        str(user.id),
        extra_claims={"role": user.role.value},
    )
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserPublic)
async def me(current: User = Depends(get_current_user)) -> User:
    return current
