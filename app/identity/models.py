from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.enums import EmployeeStatus, Role
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    parent_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    parent = relationship("Department", remote_side=[id], backref="children")
    users = relationship("User", back_populates="department")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)

    role = Column(Enum(Role), default=Role.EMPLOYEE, nullable=False)
    status = Column(Enum(EmployeeStatus), default=EmployeeStatus.ACTIVE, nullable=False)

    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(
        DateTime, default=utc_now, onupdate=utc_now, nullable=False
    )

    department = relationship("Department", back_populates="users")
