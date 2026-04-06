"""ORM models — import side effects register mappers."""

from app.models.booking import Booking, TimeSlot
from app.models.course import Course, Enrollment, Lesson, Module, Progress
from app.models.enums import (
    ApplicationStatus,
    BookingStatus,
    SubmissionStatus,
    TicketStatus,
    UserRole,
)
from app.models.job import Application, Job
from app.models.task import Submission, Task
from app.models.ticket import Message, Ticket
from app.models.user import User

__all__ = [
    "Application",
    "ApplicationStatus",
    "Booking",
    "BookingStatus",
    "Course",
    "Enrollment",
    "Job",
    "Lesson",
    "Message",
    "Module",
    "Progress",
    "Submission",
    "SubmissionStatus",
    "Task",
    "Ticket",
    "TicketStatus",
    "TimeSlot",
    "User",
    "UserRole",
]
