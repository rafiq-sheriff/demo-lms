"""Job postings and applications."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.job import Application, Job
from app.models.job_update import JobUpdate as JobUpdateModel
from app.models.user import User
from app.schemas.job import ApplicationCreate, ApplicationOut, JobCreate, JobOut, JobUpdate
from app.schemas.job_update import JobUpdateCreate, JobUpdateOut

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


@router.patch("/{job_id}", response_model=JobOut)
async def update_job(
    job_id: uuid.UUID,
    body: JobUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> Job:
    job = await db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if body.title is not None:
        job.title = body.title
    if body.description is not None:
        job.description = body.description
    if body.company is not None:
        job.company = body.company
    if body.location is not None:
        job.location = body.location
    if body.closes_at is not None:
        job.closes_at = body.closes_at
    await db.flush()
    await db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> None:
    job = await db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    await db.delete(job)
    await db.flush()


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


@router.get("/{job_id}/updates", response_model=list[JobUpdateOut])
async def list_job_updates(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[JobUpdateModel]:
    job = await db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    result = await db.execute(
        select(JobUpdateModel).where(JobUpdateModel.job_id == job_id).order_by(JobUpdateModel.created_at.desc())
    )
    return list(result.scalars().all())


@router.post("/{job_id}/updates", response_model=JobUpdateOut, status_code=status.HTTP_201_CREATED)
async def create_job_update(
    job_id: uuid.UUID,
    body: JobUpdateCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_admin),
) -> JobUpdateModel:
    job = await db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    row = JobUpdateModel(job_id=job_id, title=body.title, body=body.body, created_by=current.id)
    db.add(row)
    await db.flush()
    await db.refresh(row)
    return row
