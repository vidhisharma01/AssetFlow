from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from typing import List, Optional

from app.insights.models import AuditCycle, AuditItem, Notification, ActivityLog
from app.insights.schemas import AuditCycleCreate, AuditItemUpdate, NotificationCreate, ActivityLogCreate
from app.assets.models import Asset, Allocation, TransferRequest
from app.operations.models import Booking, MaintenanceRequest
from app.core.enums import AuditCycleStatus, AuditItemStatus, AssetStatus, MaintenanceStatus, BookingStatus

# --- Activity & Notification Utilities ---

def log_activity(db: Session, activity: ActivityLogCreate):
    db_activity = ActivityLog(**activity.model_dump())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

def create_notification(db: Session, notification: NotificationCreate):
    db_notification = Notification(**notification.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_user_notifications(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

def mark_notification_read(db: Session, notification_id: int):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        notification.is_read = True
        db.commit()
        db.refresh(notification)
    return notification

# --- Audit Cycle ---

def create_audit_cycle(db: Session, cycle_data: AuditCycleCreate, user_id: int):
    db_cycle = AuditCycle(
        name=cycle_data.name,
        department_id=cycle_data.department_id,
        start_date=cycle_data.start_date,
        end_date=cycle_data.end_date,
        created_by_id=user_id,
        status=AuditCycleStatus.PENDING
    )
    db.add(db_cycle)
    db.commit()
    db.refresh(db_cycle)
    
    # Auto-generate Audit Items for assets
    query = db.query(Asset).filter(
        Asset.status.in_([AssetStatus.AVAILABLE, AssetStatus.ALLOCATED, AssetStatus.UNDER_MAINTENANCE])
    )
    # If scoped to a department, filter by department (assuming assets have a department, or filtering via allocations)
    # The current Asset model in `assets/models.py` doesn't explicitly have department_id, 
    # but for this POC we will include all active assets if no complex join is possible.
    
    assets_to_audit = query.all()
    for asset in assets_to_audit:
        audit_item = AuditItem(
            audit_cycle_id=db_cycle.id,
            asset_id=asset.id,
            status=AuditItemStatus.UNVERIFIED
        )
        db.add(audit_item)
    
    db.commit()
    db.refresh(db_cycle)
    return db_cycle

def get_audit_cycles(db: Session):
    return db.query(AuditCycle).all()

def get_audit_cycle(db: Session, cycle_id: int):
    return db.query(AuditCycle).filter(AuditCycle.id == cycle_id).first()

def verify_audit_item(db: Session, cycle_id: int, item_id: int, item_data: AuditItemUpdate):
    item = db.query(AuditItem).filter(
        AuditItem.id == item_id, 
        AuditItem.audit_cycle_id == cycle_id
    ).first()
    
    if not item:
        return None
        
    item.status = item_data.status
    item.notes = item_data.notes
    item.verified_by_id = item_data.verified_by_id
    item.verified_at = datetime.utcnow()
    
    # Update cycle status to IN_PROGRESS if it was PENDING
    cycle = db.query(AuditCycle).filter(AuditCycle.id == cycle_id).first()
    if cycle and cycle.status == AuditCycleStatus.PENDING:
        cycle.status = AuditCycleStatus.IN_PROGRESS
        
    db.commit()
    db.refresh(item)
    return item

from app.assets.state_machine import AssetStateMachine

def close_audit_cycle(db: Session, cycle_id: int):
    cycle = db.query(AuditCycle).filter(AuditCycle.id == cycle_id).first()
    if not cycle:
        return None
        
    cycle.status = AuditCycleStatus.COMPLETED
    
    # Process discrepancies: missing items become LOST
    for item in cycle.items:
        if item.status == AuditItemStatus.MISSING:
            asset = db.query(Asset).filter(Asset.id == item.asset_id).first()
            if asset:
                if AssetStateMachine.can_transition(asset.status, AssetStatus.LOST):
                    asset.status = AssetStatus.LOST
                else:
                    # Log activity or ignore based on state machine rules
                    pass
                
    db.commit()
    db.refresh(cycle)
    return cycle

# --- Dashboards & Reports ---

def get_kpi_dashboard(db: Session):
    today = date.today()
    
    assets_available = db.query(func.count(Asset.id)).filter(Asset.status == AssetStatus.AVAILABLE).scalar()
    assets_allocated = db.query(func.count(Asset.id)).filter(Asset.status == AssetStatus.ALLOCATED).scalar()
    
    maintenance_today = db.query(func.count(MaintenanceRequest.id)).filter(
        MaintenanceRequest.status.in_([MaintenanceStatus.REPORTED, MaintenanceStatus.IN_PROGRESS])
    ).scalar()
    
    active_bookings = db.query(func.count(Booking.id)).filter(
        Booking.status == BookingStatus.APPROVED,
        func.date(Booking.start_time) <= today,
        func.date(Booking.end_time) >= today
    ).scalar()
    
    pending_transfers = db.query(func.count(TransferRequest.id)).filter(
        TransferRequest.status == "pending"
    ).scalar()
    
    upcoming_returns = db.query(func.count(Allocation.id)).filter(
        Allocation.returned_at.is_(None),
        Allocation.expected_return_date >= datetime.utcnow()
    ).scalar()
    
    overdue_returns = db.query(func.count(Allocation.id)).filter(
        Allocation.returned_at.is_(None),
        Allocation.expected_return_date < datetime.utcnow()
    ).scalar() 
    
    return {
        "assets_available": assets_available or 0,
        "assets_allocated": assets_allocated or 0,
        "maintenance_today": maintenance_today or 0,
        "active_bookings": active_bookings or 0,
        "pending_transfers": pending_transfers or 0,
        "upcoming_returns": upcoming_returns or 0,
        "overdue_returns": overdue_returns
    }

def get_activity_logs(db: Session, limit: int = 100):
    return db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()

def get_asset_utilization(db: Session):
    results = db.query(
        Asset.id,
        Asset.name,
        func.count(Allocation.id).label('allocation_count')
    ).outerjoin(Allocation, Asset.id == Allocation.asset_id).group_by(Asset.id).order_by(func.count(Allocation.id).desc()).all()
    
    return [
        {
            "asset_id": r[0],
            "asset_name": r[1],
            "allocation_count": r[2],
            "total_days_allocated": 0 
        }
        for r in results
    ]

def get_maintenance_frequency(db: Session):
    results = db.query(
        Asset.id,
        Asset.name,
        func.count(MaintenanceRequest.id).label('maintenance_count')
    ).outerjoin(MaintenanceRequest, Asset.id == MaintenanceRequest.asset_id).group_by(Asset.id).order_by(func.count(MaintenanceRequest.id).desc()).all()
    
    return [
        {
            "asset_id": r[0],
            "asset_name": r[1],
            "maintenance_count": r[2]
        }
        for r in results
    ]

def get_booking_heatmap(db: Session):
    results = db.query(
        func.date(Booking.start_time).label('date'),
        func.count(Booking.id).label('booking_count')
    ).group_by(func.date(Booking.start_time)).all()
    
    return [
        {
            "date": r[0] or date.today(),
            "booking_count": r[1]
        }
        for r in results
    ]
