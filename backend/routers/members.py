from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from backend.core.database import get_db
from backend.core.security import hash_password
from backend.models.models import User, UserRole
from backend.schemas.schemas import MemberOut, MemberInvite, MemberRoleUpdate
from backend.routers.deps import get_current_user
from backend.services.member_service import get_workspace_members

router = APIRouter(prefix="/api/workspace/members", tags=["members"])


@router.get("", response_model=list[MemberOut])
def list_members(
    search: Optional[str] = None,
    sort: str = "name",
    direction: str = "asc",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_workspace_members(db, current_user.workspace_id, search=search, sort=sort, direction=direction)


@router.post("/invite", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
def invite_member(
    body: MemberInvite,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
    user = User(
        id=str(uuid.uuid4()),
        workspace_id=current_user.workspace_id,
        email=body.email,
        password_hash=hash_password(body.password),
        first_name=body.first_name,
        last_name=body.last_name,
        role=UserRole.developer,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/role", response_model=MemberOut)
def update_member_role(
    user_id: str,
    body: MemberRoleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.role = body.role
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    user_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = False
    db.commit()
