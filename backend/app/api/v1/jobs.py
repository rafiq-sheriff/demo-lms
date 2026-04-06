"""Job postings and applications."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.job import Application, Job
from app.models.user import User
from app.schemas.job import ApplicationCreate, ApplicationOut, JobCreate, JobOut

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED)
async def create_job(
    body: JobCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_admin),
) -> Job:
    job = Job(
        title=body.title,
        description=body.description,
        company=body.company,
        location=body.location,
        created_by=current.id,
        closes_at=body.closes_at,
    )
    db.add(job)
    await db.flush()
    await db.refresh(job)
    return job


@router.get("", response_model=list[JobOut])
async def list_jobs(db: AsyncSession = Depends(get_db)) -> list[Job]:
    result = await db.execute(select(Job).order_by(Job.created_at.desc()))
    return list(result.scalars().all())


@router.post("/{job_id}/apply", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
async def apply_job(
    job_id: uuid.UUID,
    body: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Application:
    job = await db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    existing = await db.execute(
        select(Application).where(Application.job_id == job_id, Application.user_id == current.id)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already applied")
    app = Application(
        job_id=job_id,
        user_id=current.id,
        cover_letter=body.cover_letter,
        resume_url=body.resume_url,
    )
    db.add(app)
    await db.flush()
    await db.refresh(app)
    return app
