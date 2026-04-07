"""Resource library endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.course import Course, Lesson
from app.models.resource import Resource
from app.models.user import User
from app.schemas.resource import ResourceCreate, ResourceOut, ResourceUpdate

router = APIRouter(prefix="/resources", tags=["resources"])


@router.post("", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
async def create_resource(
    body: ResourceCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_admin),
) -> Resource:
    if body.course_id is not None and await db.get(Course, body.course_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if body.lesson_id is not None and await db.get(Lesson, body.lesson_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    row = Resource(
        title=body.title,
        description=body.description,
        file_url=body.file_url,
        external_url=body.external_url,
        course_id=body.course_id,
        lesson_id=body.lesson_id,
        created_by=current.id,
    )
    db.add(row)
    await db.flush()
    await db.refresh(row)
    return row


@router.get("", response_model=list[ResourceOut])
async def list_resources(
    db: AsyncSession = Depends(get_db),
    course_id: uuid.UUID | None = Query(default=None),
    lesson_id: uuid.UUID | None = Query(default=None),
) -> list[Resource]:
    q = select(Resource).order_by(Resource.created_at.desc())
    if course_id is not None:
        q = q.where(Resource.course_id == course_id)
    if lesson_id is not None:
        q = q.where(Resource.lesson_id == lesson_id)
    result = await db.execute(q)
    return list(result.scalars().all())


@router.patch("/{resource_id}", response_model=ResourceOut)
async def update_resource(
    resource_id: uuid.UUID,
    body: ResourceUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> Resource:
    row = await db.get(Resource, resource_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    if body.title is not None:
        row.title = body.title
    if body.description is not None:
        row.description = body.description
    if body.file_url is not None:
        row.file_url = body.file_url
    if body.external_url is not None:
        row.external_url = body.external_url
    if body.course_id is not None:
        if await db.get(Course, body.course_id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
        row.course_id = body.course_id
    if body.lesson_id is not None:
        if await db.get(Lesson, body.lesson_id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
        row.lesson_id = body.lesson_id
    await db.flush()
    await db.refresh(row)
    return row


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> None:
    row = await db.get(Resource, resource_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    await db.delete(row)
    await db.flush()

