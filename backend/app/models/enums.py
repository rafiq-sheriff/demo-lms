"""Shared SQLAlchemy / domain enums."""

import enum


class UserRole(str, enum.Enum):
    student = "student"
    admin = "admin"
    mentor = "mentor"


class SubmissionStatus(str, enum.Enum):
    pending = "pending"
    reviewed = "reviewed"
    rejected = "rejected"


class TicketStatus(str, enum.Enum):
    open = "open"
    closed = "closed"


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    reviewed = "reviewed"
    rejected = "rejected"
    hired = "hired"


class BatchStatus(str, enum.Enum):
    upcoming = "upcoming"
    live = "live"
    completed = "completed"


class EventType(str, enum.Enum):
    event = "event"
    deadline = "deadline"
    test = "test"


class NotificationType(str, enum.Enum):
    system = "system"
    reminder = "reminder"
    assignment = "assignment"
    event = "event"
