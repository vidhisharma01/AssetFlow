from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum as SAEnum, Boolean, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base
from app.core.enums import AuditCycleStatus, AuditItemStatus, NotificationType, ActivityAction

class AuditCycle(Base):
    __tablename__ = "audit_cycles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    department_id = Column(Integer, nullable=True) # Optional scope
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(SAEnum(AuditCycleStatus), default=AuditCycleStatus.PENDING, nullable=False)
    created_by_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    items = relationship("AuditItem", back_populates="audit_cycle", cascade="all, delete")

class AuditItem(Base):
    __tablename__ = "audit_items"
    id = Column(Integer, primary_key=True, index=True)
    audit_cycle_id = Column(Integer, ForeignKey("audit_cycles.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    status = Column(SAEnum(AuditItemStatus), default=AuditItemStatus.UNVERIFIED, nullable=False)
    notes = Column(Text, nullable=True)
    verified_by_id = Column(Integer, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    audit_cycle = relationship("AuditCycle", back_populates="items")
    # Using simple relationship to asset without explicit back_populates since it's one-way for now
    asset = relationship("Asset")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    type = Column(SAEnum(NotificationType), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    action = Column(SAEnum(ActivityAction), nullable=False)
    entity_type = Column(String, nullable=False) # e.g., 'Asset', 'Booking', 'MaintenanceRequest'
    entity_id = Column(Integer, nullable=False)
    metadata_info = Column(String, nullable=True) # JSON string or simple text for additional details
    created_at = Column(DateTime, default=datetime.utcnow)
