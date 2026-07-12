import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime

from app.main import app
from app.database import Base
from app.dependencies import get_db, get_current_user
from app.identity.models import User
from app.core.enums import Role

# Setup in-memory sqlite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Mock user for authentication
mock_user = User(
    id=1, 
    email="test@example.com", 
    hashed_password="hashed", 
    employee_id="E123", 
    first_name="Test", 
    last_name="User", 
    role=Role.ASSET_MANAGER
)

def override_get_current_user():
    return mock_user

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

def test_full_asset_lifecycle():
    # 1. Create Category
    res = client.post("/api/v1/assets/categories", json={"name": "Test Cat", "description": "Desc"})
    assert res.status_code == 200, res.text
    cat_id = res.json()["id"]

    # 2. Create Asset
    asset_data = {
        "name": "Test Asset",
        "serial_number": "SN-001",
        "asset_tag": "TAG-001",
        "department": "IT",
        "location": "NY",
        "category_id": cat_id
    }
    res = client.post("/api/v1/assets/", json=asset_data)
    assert res.status_code == 200, res.text
    asset_id = res.json()["id"]

    # 3. Allocate Asset
    alloc_data = {
        "asset_id": asset_id,
        "assigned_to_id": 99,
        "notes": "Testing",
        "expected_return_date": "2026-12-31T00:00:00"
    }
    res = client.post(f"/api/v1/assets/{asset_id}/allocate", json=alloc_data)
    assert res.status_code == 200, res.text

    # 4. Check Details
    res = client.get(f"/api/v1/assets/{asset_id}")
    assert res.status_code == 200, res.text
    assert len(res.json()["allocations"]) == 1

    # 5. Return Asset
    res = client.post(f"/api/v1/assets/{asset_id}/return", json={"notes": "Returned ok"})
    assert res.status_code == 200, res.text
    assert res.json()["status"] == "available"

    # 6. Check Final Details
    res = client.get(f"/api/v1/assets/{asset_id}")
    assert res.status_code == 200, res.text
    alloc = res.json()["allocations"][0]
    assert alloc["returned_at"] is not None
    assert "Returned ok" in alloc["notes"]

