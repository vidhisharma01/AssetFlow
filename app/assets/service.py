from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.assets import models, schemas
from app.assets.state_machine import AssetStateMachine
from app.core.enums import AssetStatus

def get_asset(db: Session, asset_id: int):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return asset

def get_assets(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Asset).offset(skip).limit(limit).all()

def create_asset(db: Session, asset: schemas.AssetCreate):
    db_asset = models.Asset(**asset.model_dump())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

def allocate_asset(db: Session, asset_id: int, allocation: schemas.AllocationCreate, current_user_id: int):
    asset = get_asset(db, asset_id)
    
    # State machine check
    AssetStateMachine.validate_transition(asset.status, AssetStatus.ALLOCATED)
    
    # Conflict check: Double allocation
    if asset.assigned_to_id is not None:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Asset is already allocated")

    # Update asset
    asset.status = AssetStatus.ALLOCATED
    asset.assigned_to_id = allocation.assigned_to_id
    
    # Create allocation record
    db_allocation = models.Allocation(
        **allocation.model_dump(),
        assigned_by_id=current_user_id
    )
    db.add(db_allocation)
    db.commit()
    db.refresh(asset)
    db.refresh(db_allocation)
    
    return asset
