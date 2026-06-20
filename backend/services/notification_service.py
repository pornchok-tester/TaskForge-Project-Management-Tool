from sqlalchemy.orm import Session

from backend.models.models import Notification


def get_unread_count(db: Session, user_id: str) -> int:
    return db.query(Notification).filter(
        Notification.recipient_id == user_id,
        Notification.is_read == False
    ).count()
