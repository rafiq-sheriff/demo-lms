"""API v1 route aggregation."""

from fastapi import APIRouter

from app.api.v1 import auth, bookings, courses, jobs, lessons, tasks, tickets, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(courses.router)
api_router.include_router(lessons.router)
api_router.include_router(tasks.router)
api_router.include_router(tickets.router)
api_router.include_router(bookings.time_router)
api_router.include_router(bookings.booking_router)
api_router.include_router(jobs.router)
