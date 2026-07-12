from typing import Generator
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import SessionLocal
# from app.identity.models import User
# from app.core.security import decode_token

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Stub for getting current user (requires identity module implementation)
def get_current_user(db: Session = Depends(get_db)):
    # TODO: Implement token decoding and user fetching from DB
    pass

# Stub for role checking
def require_role(allowed_roles: list[str]):
    def role_checker(current_user = Depends(get_current_user)):
        # if current_user.role not in allowed_roles:
        #     raise HTTPException(status_code=403, detail="Not enough permissions")
        return current_user
    return role_checker
