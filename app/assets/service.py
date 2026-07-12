from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.assets import models, schemas
from app.assets.state_machine import AssetStateMachine
from app.core.enums import AssetStatus
from typing import Optional
from datetime import datetime

def get_asset(db: Session, asset_id: int):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return asset

def get_assets(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[AssetStatus] = None,
    category_id: Optional[int] = None,
    assigned_to_id: Optional[int] = None,
    asset_tag: Optional[str] = None,
    serial_number: Optional[str] = None,
    department: Optional[str] = None,
    location: Optional[str] = None
):
    query = db.query(models.Asset)
    if status:
        query = query.filter(models.Asset.status == status)
    if category_id:
        query = query.filter(models.Asset.category_id == category_id)
    if assigned_to_id:
        query = query.filter(models.Asset.assigned_to_id == assigned_to_id)
    if asset_tag:
        query = query.filter(models.Asset.asset_tag == asset_tag)
    if serial_number:
        query = query.filter(models.Asset.serial_number == serial_number)
    if department:
        query = query.filter(models.Asset.department == department)
    if location:
        query = query.filter(models.Asset.location == location)
    return query.offset(skip).limit(limit).all()

def create_category(db: Session, category: schemas.AssetCategoryCreate):
    db_category = models.AssetCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

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

def create_transfer_request(db: Session, asset_id: int, transfer: schemas.TransferRequestCreate, current_user_id: int):
    asset = get_asset(db, asset_id)
    
    if asset.status != AssetStatus.ALLOCATED or asset.assigned_to_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Asset must be allocated to you to transfer")
    
    db_transfer = models.TransferRequest(
        asset_id=asset_id,
        from_user_id=current_user_id,
        to_user_id=transfer.to_user_id,
        status="pending"
    )
    db.add(db_transfer)
    db.commit()
    db.refresh(db_transfer)
    return db_transfer

def get_asset_details(db: Session, asset_id: int):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return asset

def return_asset(db: Session, asset_id: int, return_data: schemas.AssetReturnCreate, current_user_id: int):
    asset = get_asset(db, asset_id)
    
    if asset.status != AssetStatus.ALLOCATED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Asset is not currently allocated")
        
    active_allocation = db.query(models.Allocation).filter(
        models.Allocation.asset_id == asset.id,
        models.Allocation.returned_at == None
    ).first()
    
    if active_allocation:
        active_allocation.returned_at = datetime.utcnow()
        if active_allocation.notes:
            active_allocation.notes += f"\nReturn Notes: {return_data.notes}"
        else:
            active_allocation.notes = f"Return Notes: {return_data.notes}"
            
    asset.status = AssetStatus.AVAILABLE
    asset.assigned_to_id = None
    
    db.commit()
    db.refresh(asset)
    return asset

def approve_transfer_request(db: Session, transfer_id: int, current_user_id: int, current_user_role: str = "asset_manager"):
    if current_user_role not in ["asset_manager", "dept_head", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to approve transfers")

    transfer = db.query(models.TransferRequest).filter(models.TransferRequest.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transfer request not found")
        
    if transfer.to_user_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the recipient can approve the transfer")
        
    if transfer.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Transfer is not pending")
        
    asset = get_asset(db, transfer.asset_id)
    
    # Close old allocation if it exists
    old_allocation = db.query(models.Allocation).filter(
        models.Allocation.asset_id == asset.id, 
        models.Allocation.returned_at == None
    ).first()
    if old_allocation:
        old_allocation.returned_at = datetime.utcnow()
        
    # Create new allocation
    new_allocation = models.Allocation(
        asset_id=asset.id,
        assigned_to_id=transfer.to_user_id,
        assigned_by_id=transfer.from_user_id,
        notes=f"Transferred from user {transfer.from_user_id}"
    )
    
    # Update asset owner
    asset.assigned_to_id = transfer.to_user_id
    
    # Update transfer status
    transfer.status = "approved"
    
    db.add(new_allocation)
    db.commit()
    db.refresh(transfer)
    return transfer
