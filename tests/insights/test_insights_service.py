import pytest
from datetime import date
from app.insights import service
from app.insights.schemas import AuditCycleCreate, NotificationCreate, ActivityLogCreate
from app.core.enums import AuditCycleStatus, NotificationType, ActivityAction
from app.insights.models import AuditCycle, Notification, ActivityLog

def test_create_audit_cycle(db_session):
    cycle_data = AuditCycleCreate(
        name="Q3 Tech Audit",
        department_id=1,
        start_date=date(2026, 7, 1),
        end_date=date(2026, 7, 31)
    )
    cycle = service.create_audit_cycle(db_session, cycle_data, user_id=1)
    assert cycle.id is not None
    assert cycle.name == "Q3 Tech Audit"
    assert cycle.status == AuditCycleStatus.PENDING

def test_create_and_read_notification(db_session):
    notif_data = NotificationCreate(
        type=NotificationType.AUDIT,
        message="Audit started",
        user_id=2
    )
    notif = service.create_notification(db_session, notif_data)
    assert notif.is_read is False

    read_notif = service.mark_notification_read(db_session, notif.id)
    assert read_notif.is_read is True

def test_kpi_dashboard_empty(db_session):
    kpi = service.get_kpi_dashboard(db_session)
    assert kpi["assets_available"] == 0
    assert kpi["assets_allocated"] == 0
    assert kpi["upcoming_returns"] == 0
