from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.core.enums import AssetStatus

class AssetCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class AssetCategoryCreate(AssetCategoryBase):
    pass

class AssetCategoryResponse(AssetCategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class AssetBase(BaseModel):
    name: str
    serial_number: str
    category_id: int

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[AssetStatus] = None
    assigned_to_id: Optional[int] = None

class AssetResponse(AssetBase):
    id: int
    status: AssetStatus
    assigned_to_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AllocationBase(BaseModel):
    asset_id: int
    assigned_to_id: int
    notes: Optional[str] = None

class AllocationCreate(AllocationBase):
    pass

class AllocationResponse(AllocationBase):
    id: int
    assigned_by_id: int
    allocated_at: datetime
    returned_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
