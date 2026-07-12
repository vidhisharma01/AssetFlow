from datetime import timedelta
from app.database import SessionLocal
from app.identity.models import User, Department
from app.assets.models import Asset, AssetCategory
from app.core.enums import Role, EmployeeStatus, AssetStatus
from app.core.security import get_password_hash, create_access_token

db = SessionLocal()

# 1. Seed Department
if not db.query(Department).first():
    dept = Department(name="IT Support", code="IT", description="IT Dept")
    db.add(dept)
    db.commit()

# 2. Seed User
if not db.query(User).first():
    user = User(
        email="admin@assetflow.com",
        hashed_password=get_password_hash("password123"),
        first_name="Admin",
        last_name="User",
        employee_id="E001",
        role=Role.ADMIN,
        status=EmployeeStatus.ACTIVE,
        department_id=1
    )
    db.add(user)
    db.commit()

# 3. Seed Asset Category
if not db.query(AssetCategory).first():
    cat = AssetCategory(name="Laptops", description="Work laptops")
    db.add(cat)
    db.commit()

# 4. Seed Asset
if not db.query(Asset).first():
    asset = Asset(
        name="MacBook Pro",
        serial_number="SN-123",
        asset_tag="TAG-123",
        department="IT",
        location="NY Office",
        category_id=1,
        status=AssetStatus.AVAILABLE
    )
    db.add(asset)
    db.commit()

# Generate token for User 1
token = create_access_token(subject="1", expires_delta=timedelta(days=365))
print("TOKEN=" + token)
