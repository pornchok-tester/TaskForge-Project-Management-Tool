from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.models.models import Ticket, TicketStatus
from backend.routers.deps import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    today = date.today()
    base = db.query(Ticket).filter(
        Ticket.assignee_id == current_user.id,
        Ticket.status != TicketStatus.done,
        Ticket.due_date.isnot(None),
    )
    my_tasks_count = base.count()
    due_today_count = base.filter(Ticket.due_date == today).count()
    overdue_count = base.filter(Ticket.due_date < today).count()
    return {
        "my_tasks_count": my_tasks_count,
        "due_today_count": due_today_count,
        "overdue_count": overdue_count,
    }
