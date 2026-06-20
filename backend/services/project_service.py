from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.models.models import Project, ProjectStatus


def get_projects(db: Session, search: str = None, status: str = None, sort: str = "name-asc"):
    q = db.query(Project).filter(Project.is_deleted == False)
    if search:
        q = q.filter(Project.name.ilike(f"%{search}%"))
    if status:
        q = q.filter(Project.status == status)
    if sort == "name-asc":
        q = q.order_by(Project.name.asc())
    elif sort == "name-desc":
        q = q.order_by(Project.name.desc())
    elif sort == "newest":
        q = q.order_by(Project.created_at.desc())
    elif sort == "oldest":
        q = q.order_by(Project.created_at.asc())
    return q.all()
