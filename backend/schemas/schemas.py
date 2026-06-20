from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel

from backend.models.models import UserRole, ProjectStatus, TicketStatus, TicketPriority


# ─── Auth ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: bool = False


class UserOut(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: UserRole
    workspace_id: str

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ─── Projects ─────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None


class ProjectOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    status: ProjectStatus
    owner_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Tickets ──────────────────────────────────────────────────────────────────

class TicketCreate(BaseModel):
    title: str
    status: Optional[TicketStatus] = TicketStatus.todo


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TicketPriority] = None
    assignee_id: Optional[str] = None
    due_date: Optional[date] = None
    story_points: Optional[int] = None


class TicketStatusUpdate(BaseModel):
    status: TicketStatus


class TicketPositionUpdate(BaseModel):
    position: float
    status: TicketStatus


class TicketOut(BaseModel):
    id: str
    ticket_number: int
    project_id: str
    title: str
    description: Optional[str]
    status: TicketStatus
    priority: Optional[TicketPriority]
    assignee_id: Optional[str]
    reporter_id: str
    story_points: Optional[int]
    position: float
    due_date: Optional[date]
    assignee: Optional[UserOut]
    reporter: Optional[UserOut]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Comments ─────────────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    content: str


class CommentOut(BaseModel):
    id: str
    ticket_id: str
    author_id: str
    content: str
    author: Optional[UserOut]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Members ──────────────────────────────────────────────────────────────────

class MemberInvite(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str


class MemberRoleUpdate(BaseModel):
    role: UserRole


class MemberOut(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool
    last_active_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}
