import uuid
from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import Session

from backend.core.database import SessionLocal
from backend.core.security import hash_password
from backend.models.models import (
    Workspace, User, Project, Ticket, Notification,
    UserRole, ProjectStatus, TicketStatus, TicketPriority,
)


def run_seed(db: Session):
    if db.query(Workspace).first():
        print("Database already seeded, skipping.")
        return

    today = date.today()

    # ── Workspace ──────────────────────────────────────────────────────────────
    workspace = Workspace(id=str(uuid.uuid4()), name="TaskForge")
    db.add(workspace)
    db.flush()

    # ── Users ──────────────────────────────────────────────────────────────────
    def make_user(email, password, first, last, role, days_ago=0):
        return User(
            id=str(uuid.uuid4()),
            workspace_id=workspace.id,
            email=email,
            password_hash=hash_password(password),
            first_name=first,
            last_name=last,
            role=role,
            is_active=True,
            last_active_at=datetime.now(timezone.utc) - timedelta(days=days_ago),
        )

    admin = make_user("admin@taskforge.test", "Admin1234!", "Admin", "User", UserRole.admin, 0)
    manager = make_user("manager@taskforge.test", "Manager1234!", "Manager", "User", UserRole.manager, 1)
    dev1 = make_user("dev1@taskforge.test", "Dev1234!", "Dev", "One", UserRole.developer, 2)
    dev2 = make_user("dev2@taskforge.test", "Dev5678!", "Dev", "Two", UserRole.developer, 3)
    viewer = make_user("viewer@taskforge.test", "Viewer1234!", "Viewer", "User", UserRole.viewer, 7)
    db.add_all([admin, manager, dev1, dev2, viewer])
    db.flush()

    # ── Projects ───────────────────────────────────────────────────────────────
    def make_project(name, owner, status=ProjectStatus.active):
        return Project(
            id=str(uuid.uuid4()),
            workspace_id=workspace.id,
            name=name,
            description=f"{name} project description.",
            status=status,
            owner_id=owner.id,
        )

    alpha = make_project("Project Alpha", manager)
    beta = make_project("Project Beta", manager)
    delta = make_project("Project Delta", manager)
    gamma = make_project("Project Gamma", manager)
    iota = make_project("Project Iota", manager)
    kappa = make_project("Project Kappa", manager)
    archive_one = make_project("Project Archive One", admin, status=ProjectStatus.archived)
    db.add_all([alpha, beta, delta, gamma, iota, kappa, archive_one])
    db.flush()

    # ── Tickets in Project Alpha ────────────────────────────────────────────────
    tickets_data = [
        # title, status, priority, assignee, due_date_offset, position
        ("Fix login validation bug", TicketStatus.todo, TicketPriority.high, dev1, 0, 1000.0),
        ("Implement dark mode", TicketStatus.todo, TicketPriority.critical, admin, -3, 2000.0),
        ("Add export to CSV feature", TicketStatus.todo, TicketPriority.low, None, None, 3000.0),
        ("Refactor authentication module", TicketStatus.in_progress, TicketPriority.high, dev1, -1, 1000.0),
        ("Design new dashboard layout", TicketStatus.in_progress, TicketPriority.medium, admin, 0, 2000.0),
        ("Write API documentation", TicketStatus.in_review, TicketPriority.medium, manager, 5, 1000.0),
        ("Initial project setup", TicketStatus.done, TicketPriority.low, admin, -30, 1000.0),
        ("Basic CRUD API implementation", TicketStatus.done, TicketPriority.medium, dev1, -20, 2000.0),
    ]

    for title, t_status, priority, assignee, due_offset, position in tickets_data:
        due = (today + timedelta(days=due_offset)) if due_offset is not None else None
        ticket = Ticket(
            id=str(uuid.uuid4()),
            project_id=alpha.id,
            title=title,
            status=t_status,
            priority=priority,
            assignee_id=assignee.id if assignee else None,
            reporter_id=manager.id,
            position=position,
            due_date=due,
        )
        db.add(ticket)
    db.flush()

    # ── Notifications ──────────────────────────────────────────────────────────
    def add_notifications(user, count):
        for i in range(count):
            db.add(Notification(
                id=str(uuid.uuid4()),
                recipient_id=user.id,
                message=f"Notification {i + 1} for {user.first_name}",
                is_read=False,
            ))

    add_notifications(admin, 3)
    add_notifications(manager, 1)
    add_notifications(dev1, 1)

    db.commit()
    print("Seed complete.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()
