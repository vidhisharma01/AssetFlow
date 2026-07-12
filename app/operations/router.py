from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.operations import schemas, service
from app.core.enums import BookingStatus, MaintenanceStatus

# Assuming dependencies are set up in app.dependencies
try:
    from app.dependencies import get_db, get_current_user
except ImportError:
    # Fallback/stub if module 1/core isn't fully ready
    def get_db():
        yield None
    def get_current_user():
        return {"id": 1, "role": "employee"}

router = APIRouter()

@router.post("/bookings", response_model=schemas.BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id", 1)
    return service.create_booking(db=db, booking=booking, user_id=user_id)

@router.put("/bookings/{booking_id}/status", response_model=schemas.BookingResponse)
def update_booking_status(booking_id: int, new_status: BookingStatus, db: Session = Depends(get_db)):
    return service.update_booking_status(db=db, booking_id=booking_id, new_status=new_status)

@router.post("/maintenance", response_model=schemas.MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def raise_maintenance_request(request: schemas.MaintenanceCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id", 1)
    return service.raise_maintenance_request(db=db, request=request, requester_id=user_id)

@router.put("/maintenance/{request_id}/status", response_model=schemas.MaintenanceResponse)
def update_maintenance_status(request_id: int, update_data: schemas.MaintenanceUpdate, db: Session = Depends(get_db)):
    return service.update_maintenance_status(db=db, request_id=request_id, update_data=update_data)
