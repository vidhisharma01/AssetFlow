from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.assets import schemas, service
# from app.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.AssetResponse])
def read_assets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return service.get_assets(db, skip=skip, limit=limit)

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
