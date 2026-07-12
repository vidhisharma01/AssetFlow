from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.core.enums import BookingStatus, MaintenanceStatus

# Booking Schemas
class BookingBase(BaseModel):
    asset_id: int
    start_time: datetime
    end_time: datetime
    purpose: Optional[str] = None

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    purpose: Optional[str] = None

class BookingResponse(BookingBase):
    id: int
    user_id: int
    status: BookingStatus

    class Config:
        orm_mode = True

# Maintenance Schemas
class MaintenanceBase(BaseModel):
    asset_id: int
    issue_description: str
    photo_url: Optional[str] = None

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceUpdate(BaseModel):
    status: Optional[MaintenanceStatus] = None
    technician_id: Optional[int] = None

class MaintenanceResponse(MaintenanceBase):
    id: int
    requester_id: int
    technician_id: Optional[int] = None
    status: MaintenanceStatus
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        orm_mode = True
