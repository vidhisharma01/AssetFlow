from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.enums import Role
from app.dependencies import RoleChecker, get_current_user, get_db
from app.identity.models import User
from app.identity import service
from app.identity.schemas import (
    DepartmentCreate,
    DepartmentResponse,
    TokenResponse,
    UserLoginRequest,
    UserPromoteRequest,
    UserResponse,
    UserSignupRequest,
    UserUpdateStatusRequest,
)

router = APIRouter(tags=["Identity & Org Setup"])


@router.post(
    "/auth/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Employee Self-Signup",
)
def signup(data: UserSignupRequest, db: Session = Depends(get_db)):
    return service.signup_user(db=db, data=data)


@router.post(
    "/auth/login",
    response_model=TokenResponse,
    summary="Authenticate User & Obtain Token",
)
def login(data: UserLoginRequest, db: Session = Depends(get_db)):
    return service.authenticate_user(db=db, data=data)


@router.post(
    "/departments",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Department (Admin Only)",
    dependencies=[Depends(RoleChecker([Role.ADMIN]))],
)
def create_department(data: DepartmentCreate, db: Session = Depends(get_db)):
    return service.create_department(db=db, data=data)


@router.get(
    "/departments",
    response_model=List[DepartmentResponse],
    summary="List Departments",
)
def list_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.list_departments(db=db)


@router.get(
    "/users",
    response_model=List[UserResponse],
    summary="Employee Directory Search/List",
)
def list_users(
    department_id: Optional[int] = Query(None, description="Filter by department ID"),
    role: Optional[Role] = Query(None, description="Filter by role"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.list_users(db=db, department_id=department_id, role=role)


@router.get(
    "/users/me",
    response_model=UserResponse,
    summary="Get Current Logged-In User Profile",
)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch(
    "/users/{user_id}/promote",
    response_model=UserResponse,
    summary="Promote/Demote Employee Role (Admin Only via Employee Directory)",
    dependencies=[Depends(RoleChecker([Role.ADMIN]))],
)
def promote_user(
    user_id: int,
    data: UserPromoteRequest,
    db: Session = Depends(get_db),
):
    return service.promote_user(db=db, user_id=user_id, new_role=data.role)


@router.patch(
    "/users/{user_id}/status",
    response_model=UserResponse,
    summary="Activate/Deactivate Employee Status (Admin Only)",
    dependencies=[Depends(RoleChecker([Role.ADMIN]))],
)
def update_user_status(
    user_id: int,
    data: UserUpdateStatusRequest,
    db: Session = Depends(get_db),
):
    return service.update_user_status(db=db, user_id=user_id, new_status=data.status)
