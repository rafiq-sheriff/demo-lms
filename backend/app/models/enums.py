"""Shared SQLAlchemy / domain enums."""

import enum


class UserRole(str, enum.Enum):
    student = "student"
    admin = "admin"


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
