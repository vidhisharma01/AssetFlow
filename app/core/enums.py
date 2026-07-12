from enum import Enum

class Role(str, Enum):
    EMPLOYEE = "employee"
    DEPT_HEAD = "dept_head"
    ASSET_MANAGER = "asset_manager"
    ADMIN = "admin"

class AssetStatus(str, Enum):
    AVAILABLE = "available"
    ALLOCATED = "allocated"
    RESERVED = "reserved"
    UNDER_MAINTENANCE = "under_maintenance"
    LOST = "lost"
    RETIRED = "retired"
    DISPOSED = "disposed"

class BookingStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class MaintenanceStatus(str, Enum):
    REPORTED = "reported"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


class EmployeeStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class AuditCycleStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class AuditItemStatus(str, Enum):
    UNVERIFIED = "unverified"
    VERIFIED = "verified"
    MISSING = "missing"
    DAMAGED = "damaged"

class NotificationType(str, Enum):
    ASSET_ASSIGNED = "asset_assigned"
    MAINTENANCE = "maintenance"
    BOOKING = "booking"
    TRANSFER = "transfer"
    OVERDUE = "overdue"
    AUDIT = "audit"

class ActivityAction(str, Enum):
    CREATED = "created"
    UPDATED = "updated"
    DELETED = "deleted"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"

