import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.core.database import get_db

router = APIRouter(prefix="/api/test", tags=["test"])


@router.post("/reset")
def reset_db(db: Session = Depends(get_db)):
    start = time.time()
    db.execute(text("TRUNCATE TABLE notifications, comments, tickets, projects, users, workspaces RESTART IDENTITY CASCADE"))
    db.execute(text("ALTER SEQUENCE tickets_ticket_number_seq RESTART WITH 1"))
    db.commit()
    from backend.seed import run_seed
    run_seed(db)
    duration_ms = int((time.time() - start) * 1000)
    return {"message": "reset complete", "duration_ms": duration_ms}
