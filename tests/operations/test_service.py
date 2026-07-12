import pytest
from datetime import datetime, timedelta
from fastapi import HTTPException

from app.operations import service
from app.operations.schemas import BookingCreate, BookingUpdate, MaintenanceCreate, MaintenanceUpdate
from app.core.enums import BookingStatus, MaintenanceStatus
from app.operations.models import Booking

def test_check_booking_overlap_no_overlap(db_session):
    # Setup initial booking
    start = datetime.utcnow()
    end = start + timedelta(hours=1)
    
    booking1 = BookingCreate(
        asset_id=1,
        start_time=start,
        end_time=end,
        purpose="Meeting"
    )
    service.create_booking(db_session, booking1, user_id=1)
    
    # Check for a booking right after (should not overlap)
    next_start = end
    next_end = end + timedelta(hours=1)
    
    # Should not raise exception
    service.check_booking_overlap(db_session, asset_id=1, start_time=next_start, end_time=next_end)

def test_check_booking_overlap_with_overlap(db_session):
    start = datetime.utcnow()
    end = start + timedelta(hours=2)
    
    booking1 = BookingCreate(
        asset_id=2,
        start_time=start,
        end_time=end,
    )
    service.create_booking(db_session, booking1, user_id=1)
    
    # Attempt to book overlapping time
    overlap_start = start + timedelta(hours=1)
    overlap_end = start + timedelta(hours=3)
    
    with pytest.raises(HTTPException) as exc_info:
        service.check_booking_overlap(db_session, asset_id=2, start_time=overlap_start, end_time=overlap_end)
        
    assert exc_info.value.status_code == 400
    assert "already booked" in exc_info.value.detail

def test_check_booking_overlap_exclude_self(db_session):
    start = datetime.utcnow()
    end = start + timedelta(hours=1)
    
    booking1 = BookingCreate(
        asset_id=3,
        start_time=start,
        end_time=end,
    )
    db_booking = service.create_booking(db_session, booking1, user_id=1)
    
    # When updating a booking, it shouldn't conflict with its own existing time slot
    # Should not raise exception
    service.check_booking_overlap(db_session, asset_id=3, start_time=start, end_time=end, exclude_booking_id=db_booking.id)

def test_update_maintenance_status_resolved(db_session):
    # Raise a maintenance request
    req_data = MaintenanceCreate(
        asset_id=1,
        issue_description="Broken chair"
    )
    db_req = service.raise_maintenance_request(db_session, request=req_data, requester_id=1)
    
    assert db_req.status == MaintenanceStatus.REPORTED
    assert db_req.resolved_at is None
    
    # Resolve it
    update_data = MaintenanceUpdate(status=MaintenanceStatus.RESOLVED)
    updated_req = service.update_maintenance_status(db_session, request_id=db_req.id, update_data=update_data)
    
    assert updated_req.status == MaintenanceStatus.RESOLVED
    assert updated_req.resolved_at is not None
