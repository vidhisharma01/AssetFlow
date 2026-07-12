from typing import List

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.core.enums import EmployeeStatus, Role
from app.core.exceptions import NotAuthorizedException, UnauthenticatedException
from app.database import get_db, SessionLocal
from app.identity.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/identity/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise UnauthenticatedException("Invalid token payload")
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise UnauthenticatedException("Could not validate credentials")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise UnauthenticatedException("User not found")
    if user.status != EmployeeStatus.ACTIVE:
        raise NotAuthorizedException("User account is inactive")
    return user


class RoleChecker:
    def __init__(self, allowed_roles: List[Role]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise NotAuthorizedException(
                f"Required role: {[r.value for r in self.allowed_roles]}"
            )
        return current_user


def require_role(allowed_roles: List[Role]):
    return RoleChecker(allowed_roles)
