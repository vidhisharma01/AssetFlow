from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from app.core.enums import AuditCycleStatus, AuditItemStatus, NotificationType, ActivityAction

# --- Audit Cycle Schemas ---
class AuditCycleBase(BaseModel):
    name: str
    department_id: Optional[int] = None
    start_date: date
    end_date: date

class AuditCycleCreate(AuditCycleBase):
    pass

class AuditItemSchema(BaseModel):
    id: int
    asset_id: int
    status: AuditItemStatus
    notes: Optional[str]
    verified_by_id: Optional[int]
    verified_at: Optional[datetime]

    class Config:
        from_attributes = True

class AuditCycleResponse(AuditCycleBase):
    id: int
    status: AuditCycleStatus
    created_by_id: int
    created_at: datetime
    items: List[AuditItemSchema] = []

    class Config:
        from_attributes = True

class AuditItemUpdate(BaseModel):
    status: AuditItemStatus
    notes: Optional[str] = None
    verified_by_id: int

# --- Notification Schemas ---
class NotificationBase(BaseModel):
    type: NotificationType
    message: str

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Activity Log Schemas ---
class ActivityLogBase(BaseModel):
    action: ActivityAction
    entity_type: str
    entity_id: int
    metadata_info: Optional[str] = None

class ActivityLogCreate(ActivityLogBase):
    user_id: int

class ActivityLogResponse(ActivityLogBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Dashboard & Reports Schemas ---
class KPIDashboardResponse(BaseModel):
    assets_available: int
    assets_allocated: int
    maintenance_today: int
    active_bookings: int
    pending_transfers: int
    upcoming_returns: int
    overdue_returns: int

class AssetUtilizationReport(BaseModel):
    asset_id: int
    asset_name: str
    allocation_count: int
    total_days_allocated: int
