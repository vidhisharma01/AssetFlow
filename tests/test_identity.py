import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.enums import Role
from app.database import Base, get_db
from app.identity.models import User
from app.main import app

from sqlalchemy.pool import StaticPool

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    app.dependency_overrides.clear()
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_employee_signup():
    payload = {
        "email": "alice@assetflow.corp",
        "password": "SecurePassword123!",
        "first_name": "Alice",
        "last_name": "Smith",
        "employee_id": "EMP-1001",
    }
    response = client.post("/api/v1/identity/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alice@assetflow.corp"
    assert data["role"] == Role.EMPLOYEE.value


def test_employee_login():
    payload = {
        "email": "alice@assetflow.corp",
        "password": "SecurePassword123!",
    }
    response = client.post("/api/v1/identity/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_non_admin_cannot_create_department():
    # Login as Alice (Employee)
    login_resp = client.post(
        "/api/v1/identity/auth/login",
        json={"email": "alice@assetflow.corp", "password": "SecurePassword123!"},
    )
    token = login_resp.json()["access_token"]

    dept_payload = {
        "name": "Engineering",
        "code": "ENG",
        "description": "Software Engineering Department",
    }
    response = client.post(
        "/api/v1/identity/departments",
        json=dept_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_admin_promote_and_department_creation():
    # Bootstrap Alice as Admin in database directly
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "alice@assetflow.corp").first()
    user.role = Role.ADMIN
    db.commit()
    db.close()

    # Login as Admin Alice
    login_resp = client.post(
        "/api/v1/identity/auth/login",
        json={"email": "alice@assetflow.corp", "password": "SecurePassword123!"},
    )
    token = login_resp.json()["access_token"]

    # Create department
    dept_payload = {
        "name": "Engineering",
        "code": "ENG",
        "description": "Software Engineering Department",
    }
    response = client.post(
        "/api/v1/identity/departments",
        json=dept_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Engineering"

    # Signup Bob as Employee
    client.post(
        "/api/v1/identity/auth/signup",
        json={
            "email": "bob@assetflow.corp",
            "password": "SecurePassword123!",
            "first_name": "Bob",
            "last_name": "Jones",
            "employee_id": "EMP-1002",
        },
    )

    # Promote Bob to Department Head using Admin token
    db = TestingSessionLocal()
    bob = db.query(User).filter(User.email == "bob@assetflow.corp").first()
    bob_id = bob.id
    db.close()

    promote_resp = client.patch(
        f"/api/v1/identity/users/{bob_id}/promote",
        json={"role": Role.DEPT_HEAD.value},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert promote_resp.status_code == 200
    assert promote_resp.json()["role"] == Role.DEPT_HEAD.value
