from sqlalchemy import Column, Integer, String, DateTime, Enum, Text
from datetime import datetime

from app.database import Base
from app.core.enums import BookingStatus, MaintenanceStatus

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, index=True, nullable=False)
    user_id = Column(Integer, index=True, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    purpose = Column(String(255), nullable=True)

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, index=True, nullable=False)
    requester_id = Column(Integer, index=True, nullable=False)
    technician_id = Column(Integer, index=True, nullable=True)
    issue_description = Column(Text, nullable=False)
    status = Column(Enum(MaintenanceStatus), default=MaintenanceStatus.REPORTED)
    photo_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
