"""initial schema

Revision ID: 0001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS workspaces (
            id VARCHAR NOT NULL PRIMARY KEY,
            name VARCHAR NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE user_role AS ENUM ('admin', 'manager', 'developer', 'viewer');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR NOT NULL PRIMARY KEY,
            workspace_id VARCHAR NOT NULL REFERENCES workspaces(id),
            email VARCHAR NOT NULL UNIQUE,
            password_hash VARCHAR NOT NULL,
            first_name VARCHAR NOT NULL,
            last_name VARCHAR NOT NULL,
            role user_role NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            last_active_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email)")

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE project_status AS ENUM ('active', 'archived');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id VARCHAR NOT NULL PRIMARY KEY,
            workspace_id VARCHAR NOT NULL REFERENCES workspaces(id),
            name VARCHAR NOT NULL,
            description TEXT,
            status project_status NOT NULL DEFAULT 'active',
            owner_id VARCHAR NOT NULL REFERENCES users(id),
            is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    op.execute("CREATE SEQUENCE IF NOT EXISTS tickets_ticket_number_seq START WITH 1")

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE ticket_status AS ENUM ('todo', 'in_progress', 'in_review', 'done');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id VARCHAR NOT NULL PRIMARY KEY,
            ticket_number INTEGER NOT NULL DEFAULT nextval('tickets_ticket_number_seq'),
            project_id VARCHAR NOT NULL REFERENCES projects(id),
            title VARCHAR NOT NULL,
            description TEXT,
            status ticket_status NOT NULL DEFAULT 'todo',
            priority ticket_priority,
            assignee_id VARCHAR REFERENCES users(id),
            reporter_id VARCHAR NOT NULL REFERENCES users(id),
            story_points INTEGER,
            position DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
            due_date DATE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id VARCHAR NOT NULL PRIMARY KEY,
            ticket_id VARCHAR NOT NULL REFERENCES tickets(id),
            author_id VARCHAR NOT NULL REFERENCES users(id),
            content TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id VARCHAR NOT NULL PRIMARY KEY,
            recipient_id VARCHAR NOT NULL REFERENCES users(id),
            message TEXT NOT NULL,
            is_read BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)


def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('comments')
    op.drop_table('tickets')
    op.drop_table('projects')
    op.drop_table('users')
    op.drop_table('workspaces')
    op.execute("DROP SEQUENCE IF EXISTS tickets_ticket_number_seq")
    op.execute("DROP TYPE IF EXISTS ticket_priority")
    op.execute("DROP TYPE IF EXISTS ticket_status")
    op.execute("DROP TYPE IF EXISTS project_status")
    op.execute("DROP TYPE IF EXISTS user_role")
