from sqlalchemy.orm import Session

from backend.models.models import User


def get_workspace_members(db: Session, workspace_id: str, search: str = None, sort: str = "name", direction: str = "asc"):
    q = db.query(User).filter(User.workspace_id == workspace_id, User.is_active == True)
    if search:
        q = q.filter(
            (User.first_name + " " + User.last_name).ilike(f"%{search}%") |
            User.email.ilike(f"%{search}%")
        )
    col = getattr(User, "first_name" if sort == "name" else sort, User.first_name)
    q = q.order_by(col.asc() if direction == "asc" else col.desc())
    return q.all()
