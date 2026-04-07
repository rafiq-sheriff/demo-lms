"""Admin dashboard schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import Field

from app.schemas.common import ORMModel


class AdminStatsOut(ORMModel):
    total_users: int
    total_courses: int
    active_enrollments: int
    tasks_submitted: int
    open_doubts: int
    booked_appointments: int


class TimeSeriesPoint(ORMModel):
    date: str  # ISO date YYYY-MM-DD
    value: int


class AdminChartsOut(ORMModel):
    user_signups: list[TimeSeriesPoint] = Field(default_factory=list)
    enrollments: list[TimeSeriesPoint] = Field(default_factory=list)
    task_submissions: list[TimeSeriesPoint] = Field(default_factory=list)


class AdminActivityItem(ORMModel):
    id: str
    type: str  # user | enrollment | doubt | submission
    title: str
    subtitle: str | None = None
    created_at: datetime


class AdminActivityOut(ORMModel):
    items: list[AdminActivityItem] = Field(default_factory=list)
