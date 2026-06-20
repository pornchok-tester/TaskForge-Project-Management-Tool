from sqlalchemy.orm import Session

from backend.models.models import Ticket


def get_tickets_for_project(db: Session, project_id: str, status: str = None, assignee_id: str = None):
    q = db.query(Ticket).filter(Ticket.project_id == project_id)
    if status:
        q = q.filter(Ticket.status == status)
    if assignee_id:
        q = q.filter(Ticket.assignee_id == assignee_id)
    return q.order_by(Ticket.position.asc()).all()


def get_midpoint_position(before: float = None, after: float = None) -> float:
    if before is None and after is None:
        return 1000.0
    if before is None:
        return after / 2
    if after is None:
        return before + 1000.0
    return (before + after) / 2
