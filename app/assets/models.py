from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.core.enums import AssetStatus

class AssetCategory(Base):
    __tablename__ = "asset_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)

    assets = relationship("Asset", back_populates="category")

class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    serial_number = Column(String, unique=True, index=True, nullable=False)
    asset_tag = Column(String, unique=True, index=True, nullable=True)
    department = Column(String, index=True, nullable=True)
    location = Column(String, index=True, nullable=True)
    category_id = Column(Integer, ForeignKey("asset_categories.id"))
    status = Column(SAEnum(AssetStatus), default=AssetStatus.AVAILABLE, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # We will use simple integers for user IDs since Identity module isn't built yet
    assigned_to_id = Column(Integer, nullable=True) 

    category = relationship("AssetCategory", back_populates="assets")
    allocations = relationship("Allocation", back_populates="asset")
    transfer_requests = relationship("TransferRequest", back_populates="asset")

class Allocation(Base):
    __tablename__ = "allocations"
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    assigned_to_id = Column(Integer, nullable=False)
    assigned_by_id = Column(Integer, nullable=False)
    allocated_at = Column(DateTime, default=datetime.utcnow)
    expected_return_date = Column(DateTime, nullable=True)
    returned_at = Column(DateTime, nullable=True)
    notes = Column(String)

    asset = relationship("Asset", back_populates="allocations")

class TransferRequest(Base):
    __tablename__ = "transfer_requests"
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    from_user_id = Column(Integer, nullable=False)
    to_user_id = Column(Integer, nullable=False)
    requested_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending") 

    asset = relationship("Asset", back_populates="transfer_requests")
