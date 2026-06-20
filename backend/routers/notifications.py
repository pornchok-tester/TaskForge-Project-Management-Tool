from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.routers.deps import get_current_user
from backend.services.notification_service import get_unread_count

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return {"count": get_unread_count(db, current_user.id)}
