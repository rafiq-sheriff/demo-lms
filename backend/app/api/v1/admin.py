"""Admin dashboard aggregates (stats, charts, activity)."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.booking import Booking
from app.models.course import Course, Enrollment
from app.models.enums import BookingStatus, TicketStatus
from app.models.task import Submission, Task
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.admin import AdminActivityItem, AdminActivityOut, AdminChartsOut, AdminStatsOut, TimeSeriesPoint

router = APIRouter(prefix="/admin", tags=["admin"])

_DAYS = 14


def _day_start_series() -> list[datetime]:
    now = datetime.now(UTC)
    start = (now - timedelta(days=_DAYS)).replace(hour=0, minute=0, second=0, microsecond=0)
    return [start + timedelta(days=i) for i in range(_DAYS + 1)]


def _fill_series(rows: list[tuple[object, int]], day_keys: list[datetime]) -> list[TimeSeriesPoint]:
    m: dict[str, int] = {}
    for bucket, cnt in rows:
        if bucket is None:
            continue
        if isinstance(bucket, datetime):
            b = bucket
            if b.tzinfo is None:
                b = b.replace(tzinfo=UTC)
            key = b.date().isoformat()
        else:
            key = str(bucket)[:10]
        m[key] = m.get(key, 0) + int(cnt)
    out: list[TimeSeriesPoint] = []
    for d in day_keys:
        k = d.date().isoformat()
        out.append(TimeSeriesPoint(date=k, value=m.get(k, 0)))
    return out


@router.get("/stats", response_model=AdminStatsOut)
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> AdminStatsOut:
    total_users = int((await db.execute(select(func.count(User.id)))).scalar_one() or 0)
    total_courses = int((await db.execute(select(func.count(Course.id)))).scalar_one() or 0)
    active_enrollments = int((await db.execute(select(func.count(Enrollment.id)))).scalar_one() or 0)
    tasks_submitted = int((await db.execute(select(func.count(Submission.id)))).scalar_one() or 0)
    open_doubts = int(
        (
            await db.execute(select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.open))
        ).scalar_one()
        or 0
    )
    booked_appointments = int(
        (
            await db.execute(
                select(func.count(Booking.id)).where(
                    Booking.status.in_(
                        (BookingStatus.pending, BookingStatus.confirmed, BookingStatus.completed)
                    )
                )
            )
        ).scalar_one()
        or 0
    )
    return AdminStatsOut(
        total_users=total_users,
        total_courses=total_courses,
        active_enrollments=active_enrollments,
        tasks_submitted=tasks_submitted,
        open_doubts=open_doubts,
        booked_appointments=booked_appointments,
    )


@router.get("/charts", response_model=AdminChartsOut)
async def admin_charts(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> AdminChartsOut:
    cutoff = datetime.now(UTC) - timedelta(days=_DAYS)
    day_series = _day_start_series()

    user_bucket = func.date_trunc("day", User.created_at).label("bucket")
    enrollment_bucket = func.date_trunc("day", Enrollment.enrolled_at).label("bucket")
    submission_bucket = func.date_trunc("day", Submission.submitted_at).label("bucket")

    u_rows = (
        await db.execute(
            select(user_bucket, func.count(User.id))
            .where(User.created_at >= cutoff)
            .group_by(user_bucket)
        )
    ).all()
    e_rows = (
        await db.execute(
            select(
                enrollment_bucket,
                func.count(Enrollment.id),
            )
            .where(Enrollment.enrolled_at >= cutoff)
            .group_by(enrollment_bucket)
        )
    ).all()
    s_rows = (
        await db.execute(
            select(
                submission_bucket,
                func.count(Submission.id),
            )
            .where(Submission.submitted_at >= cutoff)
            .group_by(submission_bucket)
        )
    ).all()

    u_data = [(r[0], r[1]) for r in u_rows]
    e_data = [(r[0], r[1]) for r in e_rows]
    s_data = [(r[0], r[1]) for r in s_rows]

    return AdminChartsOut(
        user_signups=_fill_series(u_data, day_series),
        enrollments=_fill_series(e_data, day_series),
        task_submissions=_fill_series(s_data, day_series),
    )


@router.get("/activity", response_model=AdminActivityOut)
async def admin_activity(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> AdminActivityOut:
    items: list[AdminActivityItem] = []

    u_result = await db.execute(select(User).order_by(User.created_at.desc()).limit(8))
    for u in u_result.scalars().all():
        items.append(
            AdminActivityItem(
                id=str(u.id),
                type="user",
                title=f"New user: {u.full_name}",
                subtitle=u.email,
                created_at=u.created_at,
            )
        )

    e_result = await db.execute(
        select(Enrollment, User, Course)
        .select_from(Enrollment)
        .join(User, Enrollment.user_id == User.id)
        .join(Course, Enrollment.course_id == Course.id)
        .order_by(Enrollment.enrolled_at.desc())
        .limit(8)
    )
    for row in e_result.all():
        en, usr, course = row[0], row[1], row[2]
        items.append(
            AdminActivityItem(
                id=str(en.id),
                type="enrollment",
                title=f"Enrollment: {course.title}",
                subtitle=usr.email,
                created_at=en.enrolled_at,
            )
        )

    t_result = await db.execute(select(Ticket).order_by(Ticket.created_at.desc()).limit(8))
    for t in t_result.scalars().all():
        items.append(
            AdminActivityItem(
                id=str(t.id),
                type="doubt",
                title=t.subject,
                subtitle=f"Status: {t.status.value}",
                created_at=t.created_at,
            )
        )

    sub_result = await db.execute(
        select(Submission, Task, User)
        .select_from(Submission)
        .join(Task, Submission.task_id == Task.id)
        .join(User, Submission.user_id == User.id)
        .order_by(Submission.submitted_at.desc())
        .limit(8)
    )
    for row in sub_result.all():
        sub, task, usr = row[0], row[1], row[2]
        items.append(
            AdminActivityItem(
                id=str(sub.id),
                type="submission",
                title=f"Task submission: {task.title}",
                subtitle=usr.email,
                created_at=sub.submitted_at,
            )
        )

    items.sort(key=lambda x: x.created_at, reverse=True)
    return AdminActivityOut(items=items[:24])
