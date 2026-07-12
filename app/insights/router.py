from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import io
import csv

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

# --- Detailed Analytics & Logs ---

@router.get("/activity-logs", response_model=List[schemas.ActivityLogResponse])
def get_activity_logs_api(limit: int = 100, db: Session = Depends(get_db)):
    """Fetch the full activity audit log."""
    return service.get_activity_logs(db, limit)

@router.get("/reports/utilization", response_model=List[schemas.AssetUtilizationReport])
def get_utilization_report_api(db: Session = Depends(get_db)):
    """Asset utilization trends (most used vs idle)."""
    return service.get_asset_utilization(db)

@router.get("/reports/maintenance", response_model=List[schemas.MaintenanceFrequencyReport])
def get_maintenance_report_api(db: Session = Depends(get_db)):
    """Maintenance frequency by asset."""
    return service.get_maintenance_frequency(db)

@router.get("/reports/heatmap", response_model=List[schemas.BookingHeatmapReport])
def get_booking_heatmap_api(db: Session = Depends(get_db)):
    """Resource booking heatmap (peak usage windows)."""
    return service.get_booking_heatmap(db)

@router.get("/reports/export/csv")
def export_utilization_csv_api(db: Session = Depends(get_db)):
    """Export the asset utilization report as a CSV file."""
    data = service.get_asset_utilization(db)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Asset ID", "Asset Name", "Allocation Count"])
    for row in data:
        writer.writerow([row["asset_id"], row["asset_name"], row["allocation_count"]])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=asset_utilization.csv"}
    )
