from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.insights import schemas, service

router = APIRouter()

# --- Dashboards & Reports ---

@router.get("/dashboard/kpi", response_model=schemas.KPIDashboardResponse)
def get_kpi_dashboard_api(db: Session = Depends(get_db)):
    """Get KPI dashboard metrics."""
    return service.get_kpi_dashboard(db)

# --- Audits ---

@router.post("/audits", response_model=schemas.AuditCycleResponse, status_code=status.HTTP_201_CREATED)
def create_audit_cycle_api(cycle_data: schemas.AuditCycleCreate, db: Session = Depends(get_db)):
    """Create a new audit cycle and auto-generate audit items for assets."""
    # Assuming user_id=1 for now since auth isn't fully set up
    user_id = 1
    return service.create_audit_cycle(db=db, cycle_data=cycle_data, user_id=user_id)

@router.get("/audits", response_model=List[schemas.AuditCycleResponse])
def get_audit_cycles_api(db: Session = Depends(get_db)):
    """List all audit cycles."""
    return service.get_audit_cycles(db)

@router.get("/audits/{cycle_id}", response_model=schemas.AuditCycleResponse)
def get_audit_cycle_api(cycle_id: int, db: Session = Depends(get_db)):
    """Get a specific audit cycle with items."""
    cycle = service.get_audit_cycle(db, cycle_id)
    if not cycle:
        raise HTTPException(status_code=404, detail="Audit cycle not found")
    return cycle

@router.put("/audits/{cycle_id}/items/{item_id}", response_model=schemas.AuditItemSchema)
def verify_audit_item_api(cycle_id: int, item_id: int, item_data: schemas.AuditItemUpdate, db: Session = Depends(get_db)):
    """Verify an audit item."""
    item = service.verify_audit_item(db, cycle_id, item_id, item_data)
    if not item:
        raise HTTPException(status_code=404, detail="Audit item not found")
    return item

@router.post("/audits/{cycle_id}/close", response_model=schemas.AuditCycleResponse)
def close_audit_cycle_api(cycle_id: int, db: Session = Depends(get_db)):
    """Close an audit cycle and resolve missing items."""
    cycle = service.close_audit_cycle(db, cycle_id)
    if not cycle:
        raise HTTPException(status_code=404, detail="Audit cycle not found")
    return cycle

# --- Notifications ---

@router.get("/notifications", response_model=List[schemas.NotificationResponse])
def get_notifications_api(db: Session = Depends(get_db)):
    """Get notifications for the current user."""
    # Hardcoded user_id=1 for POC
    user_id = 1
    return service.get_user_notifications(db, user_id)

@router.put("/notifications/{notification_id}/read", response_model=schemas.NotificationResponse)
def mark_notification_read_api(notification_id: int, db: Session = Depends(get_db)):
    """Mark a notification as read."""
    notification = service.mark_notification_read(db, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification
