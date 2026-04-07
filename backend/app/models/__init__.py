"""ORM models — import side effects register mappers."""

from app.models.batch import Batch
from app.models.booking import Booking, TimeSlot
from app.models.course import Course, Enrollment, Lesson, Module, Progress
from app.models.enums import (
    ApplicationStatus,
    BatchStatus,
    BookingStatus,
    EventType,
    NotificationType,
    SubmissionStatus,
    TicketStatus,
    UserRole,
)
from app.models.event import Event
from app.models.faq import FAQ
from app.models.job import Application, Job
from app.models.job_update import JobUpdate
from app.models.notification import Notification
from app.models.resource import Resource
from app.models.task import Submission, Task
from app.models.ticket import Message, Ticket
from app.models.user import User

__all__ = [
    "Application",
    "ApplicationStatus",
    "Batch",
    "BatchStatus",
    "Booking",
    "BookingStatus",
    "Course",
    "Enrollment",
    "Event",
    "EventType",
    "FAQ",
    "Job",
    "JobUpdate",
    "Notification",
    "NotificationType",
    "Resource",
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
