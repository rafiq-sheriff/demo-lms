"""API v1 route aggregation."""

from fastapi import APIRouter

from app.api.v1 import (
    admin,
    auth,
    batches,
    bookings,
    chat,
    courses,
    events,
    faqs,
    jobs,
    lessons,
    notifications,
    resources,
    tasks,
    tickets,
    uploads,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(users.router)
api_router.include_router(uploads.router)
api_router.include_router(courses.router)
api_router.include_router(lessons.router)
api_router.include_router(tasks.router)
api_router.include_router(tickets.router)
api_router.include_router(bookings.time_router)
api_router.include_router(bookings.booking_router)
api_router.include_router(jobs.router)
api_router.include_router(resources.router)
api_router.include_router(batches.router)
api_router.include_router(events.router)
api_router.include_router(notifications.router)
api_router.include_router(faqs.router)
api_router.include_router(chat.router)
