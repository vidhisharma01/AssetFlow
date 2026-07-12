from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.enums import AssetStatus
from app.database import get_db
from app.assets import schemas, service
# from app.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.AssetResponse])
def read_assets(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[AssetStatus] = None,
    category_id: Optional[int] = None,
    assigned_to_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return service.get_assets(
        db, 
        skip=skip, 
        limit=limit, 
        status=status, 
        category_id=category_id, 
        assigned_to_id=assigned_to_id
    )

@router.post("/", response_model=schemas.AssetResponse)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    return service.create_asset(db, asset=asset)

@router.post("/{asset_id}/allocate", response_model=schemas.AssetResponse)
def allocate_asset(
    asset_id: int, 
    allocation: schemas.AllocationCreate, 
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user) # Uncomment when identity is ready
):
    # Mocking current_user_id for now
    current_user_id = 1
    return service.allocate_asset(db, asset_id=asset_id, allocation=allocation, current_user_id=current_user_id)

@router.post("/{asset_id}/transfer", response_model=schemas.TransferRequestResponse)
def create_transfer_request(
    asset_id: int,
    transfer: schemas.TransferRequestCreate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    current_user_id = 1 # Assuming user 1 is logged in
    return service.create_transfer_request(db, asset_id=asset_id, transfer=transfer, current_user_id=current_user_id)

@router.post("/transfers/{transfer_id}/approve", response_model=schemas.TransferRequestResponse)
def approve_transfer_request(
    transfer_id: int,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    # Mocking as user 2 since user 2 is receiving it in tests
    current_user_id = 2
    return service.approve_transfer_request(db, transfer_id=transfer_id, current_user_id=current_user_id)
