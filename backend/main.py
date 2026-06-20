from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import auth, projects, tickets, members, notifications, dashboard, test_utils

app = FastAPI(title="TaskForge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tickets.router)
app.include_router(members.router)
app.include_router(notifications.router)
app.include_router(dashboard.router)
app.include_router(test_utils.router)


@app.get("/health")
def health():
    return {"status": "ok"}
