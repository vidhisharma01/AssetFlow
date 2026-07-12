from typing import List, Optional

from sqlalchemy.orm import Session

from app.core.enums import EmployeeStatus, Role
from app.core.exceptions import BadRequestException, NotFoundException, UnauthenticatedException
from app.core.security import create_access_token, get_password_hash, verify_password
from app.identity.models import Department, User
from app.identity.schemas import DepartmentCreate, TokenResponse, UserLoginRequest, UserSignupRequest


def signup_user(db: Session, data: UserSignupRequest) -> User:
    existing = (
        db.query(User)
        .filter((User.email == data.email) | (User.employee_id == data.employee_id))
        .first()
    )
    if existing:
        raise BadRequestException("User with this email or employee ID already exists")

    if data.department_id is not None:
        dept = db.query(Department).filter(Department.id == data.department_id).first()
        if not dept:
            raise NotFoundException("Specified department does not exist")

    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        employee_id=data.employee_id,
        department_id=data.department_id,
        role=Role.EMPLOYEE,
        status=EmployeeStatus.ACTIVE,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, data: UserLoginRequest) -> TokenResponse:
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise UnauthenticatedException("Invalid email or password")
    if user.status != EmployeeStatus.ACTIVE:
        raise UnauthenticatedException("User account is inactive")

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, token_type="bearer", user=user)


def create_department(db: Session, data: DepartmentCreate) -> Department:
    existing = (
        db.query(Department)
        .filter((Department.name == data.name) | (Department.code == data.code))
        .first()
    )
    if existing:
        raise BadRequestException("Department with this name or code already exists")

    if data.parent_id is not None:
        parent = db.query(Department).filter(Department.id == data.parent_id).first()
        if not parent:
            raise NotFoundException("Parent department not found")

    dept = Department(
        name=data.name,
        code=data.code,
        description=data.description,
        parent_id=data.parent_id,
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


def list_departments(db: Session) -> List[Department]:
    return db.query(Department).order_by(Department.name).all()


def list_users(
    db: Session,
    department_id: Optional[int] = None,
    role: Optional[Role] = None,
) -> List[User]:
    query = db.query(User)
    if department_id is not None:
        query = query.filter(User.department_id == department_id)
    if role is not None:
        query = query.filter(User.role == role)
    return query.order_by(User.last_name, User.first_name).all()


def promote_user(db: Session, user_id: int, new_role: Role) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException("User not found")
    user.role = new_role
    db.commit()
    db.refresh(user)
    return user


def update_user_status(db: Session, user_id: int, new_status: EmployeeStatus) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException("User not found")
    user.status = new_status
    db.commit()
    db.refresh(user)
    return user
