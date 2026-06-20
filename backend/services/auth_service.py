from sqlalchemy.orm import Session

from backend.models.models import User
from backend.core.security import verify_password


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


def get_user_by_id(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id, User.is_active == True).first()
