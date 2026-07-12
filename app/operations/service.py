from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException, status

from app.operations.models import Booking, MaintenanceRequest
from app.operations.schemas import BookingCreate, BookingUpdate, MaintenanceCreate, MaintenanceUpdate
from app.core.enums import BookingStatus, MaintenanceStatus, AssetStatus

def check_booking_overlap(db: Session, asset_id: int, start_time: datetime, end_time: datetime, exclude_booking_id: int = None):
    """
    Check if a booking overlaps with any existing PENDING or APPROVED bookings for an asset.
    """
    query = db.query(Booking).filter(
        Booking.asset_id == asset_id,
        Booking.status.in_([BookingStatus.PENDING, BookingStatus.APPROVED]),
        Booking.start_time < end_time,
        Booking.end_time > start_time
    )
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)
        
    overlapping_booking = query.first()
    if overlapping_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The asset is already booked for the requested time slot."
        )

def create_booking(db: Session, booking: BookingCreate, user_id: int):
    if booking.start_time >= booking.end_time:
        raise HTTPException(status_code=400, detail="End time must be after start time")
        
    check_booking_overlap(db, booking.asset_id, booking.start_time, booking.end_time)
    
    db_booking = Booking(
        asset_id=booking.asset_id,
        user_id=user_id,
        start_time=booking.start_time,
        end_time=booking.end_time,
        purpose=booking.purpose,
        status=BookingStatus.PENDING
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def update_booking_status(db: Session, booking_id: int, new_status: BookingStatus):
    db_booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if new_status == BookingStatus.APPROVED:
        # Re-verify overlap just in case before approving
        check_booking_overlap(db, db_booking.asset_id, db_booking.start_time, db_booking.end_time, exclude_booking_id=db_booking.id)
        
    db_booking.status = new_status
    db.commit()
    db.refresh(db_booking)
    return db_booking

def raise_maintenance_request(db: Session, request: MaintenanceCreate, requester_id: int):
    db_req = MaintenanceRequest(
        asset_id=request.asset_id,
        requester_id=requester_id,
        issue_description=request.issue_description,
        photo_url=request.photo_url,
        status=MaintenanceStatus.REPORTED
    )
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req

def update_maintenance_status(db: Session, request_id: int, update_data: MaintenanceUpdate):
    db_req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Maintenance request not found")

    if update_data.status:
        db_req.status = update_data.status
        if update_data.status == MaintenanceStatus.RESOLVED:
            db_req.resolved_at = datetime.utcnow()
            
    if update_data.technician_id:
        db_req.technician_id = update_data.technician_id

    db.commit()
    db.refresh(db_req)
    return db_req
