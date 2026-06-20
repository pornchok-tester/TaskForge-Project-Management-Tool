# TaskForge — Project Management Tool

A full-stack project management application with Kanban boards.

## Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS + dnd-kit |
| Backend  | FastAPI + SQLAlchemy + Alembic |
| Database | PostgreSQL 15 |

---

## Quick Start

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Seed Credentials (auto-seeded on startup)

| Email | Password | Role |
|-------|----------|------|
| admin@taskforge.test | Admin1234! | admin |
| manager@taskforge.test | Manager1234! | manager |
| dev1@taskforge.test | Dev1234! | developer |
| dev2@taskforge.test | Dev5678! | developer |
| viewer@taskforge.test | Viewer1234! | viewer |

---

## Reset Database

```bash
curl -X POST http://localhost:8000/api/test/reset
```

Truncates all tables and re-seeds with the default data above.

---

## Project Structure

```
.
├── backend/              # FastAPI application
│   ├── core/             # Config, database, security
│   ├── models/           # SQLAlchemy models
│   ├── routers/          # API endpoints
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   └── seed.py           # Database seed data
├── frontend/             # Next.js application
│   └── src/
│       ├── app/          # Next.js App Router pages
│       ├── components/   # React components
│       ├── contexts/     # AuthContext, ToastContext
│       ├── lib/          # axios client
│       └── types/        # TypeScript interfaces
├── alembic/              # Database migrations (runs automatically on startup)
├── docker-compose.yml
├── Dockerfile.api
├── Dockerfile.web
└── .env
```

---

## Key UI Attributes (for automation)

| Element | Locator |
|---------|---------|
| Project cards | `data-project-id` |
| Ticket cards | `data-ticket-id` (UUID) |
| Board columns | `data-status` |
| Member rows | CSS class `member-row` |

All interactive elements have stable `id` attributes (e.g., `email-input`, `btn-login`, `navbar`).
