from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from app.core.enums import EmployeeStatus, Role


class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    parent_id: Optional[int] = None


class DepartmentResponse(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    parent_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserSignupRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    employee_id: str
    department_id: Optional[int] = None


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    employee_id: str
    first_name: str
    last_name: str
    role: Role
    status: EmployeeStatus
    department_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserPromoteRequest(BaseModel):
    role: Role


class UserUpdateStatusRequest(BaseModel):
    status: EmployeeStatus
