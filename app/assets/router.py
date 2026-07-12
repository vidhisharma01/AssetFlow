from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.enums import AssetStatus
from app.dependencies import get_db
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
    asset_tag: Optional[str] = None,
    serial_number: Optional[str] = None,
    department: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return service.get_assets(
        db, 
        skip=skip, 
        limit=limit, 
        status=status, 
        category_id=category_id, 
        assigned_to_id=assigned_to_id,
        asset_tag=asset_tag,
        serial_number=serial_number,
        department=department,
        location=location
    )

@router.post("/categories", response_model=schemas.AssetCategoryResponse)
def create_category(category: schemas.AssetCategoryCreate, db: Session = Depends(get_db)):
    return service.create_category(db, category=category)

@router.post("/", response_model=schemas.AssetResponse)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    return service.create_asset(db, asset=asset)

@router.get("/{asset_id}", response_model=schemas.AssetDetailResponse)
def read_asset_details(asset_id: int, db: Session = Depends(get_db)):
    return service.get_asset_details(db, asset_id=asset_id)

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

@router.post("/{asset_id}/return", response_model=schemas.AssetResponse)
def return_asset(
    asset_id: int,
    return_data: schemas.AssetReturnCreate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    current_user_id = 1
    return service.return_asset(db, asset_id=asset_id, return_data=return_data, current_user_id=current_user_id)

@router.post("/transfers/{transfer_id}/approve", response_model=schemas.TransferRequestResponse)
def approve_transfer_request(
    transfer_id: int,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    # Mocking user 2 with a manager role
    current_user_id = 2
    current_user_role = "asset_manager"
    return service.approve_transfer_request(db, transfer_id=transfer_id, current_user_id=current_user_id, current_user_role=current_user_role)
