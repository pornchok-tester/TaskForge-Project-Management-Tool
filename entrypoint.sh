#!/bin/bash
set -e

echo "Running Alembic migrations..."
alembic upgrade head

echo "Running seed script..."
python -m backend.seed

echo "Starting API server..."
exec uvicorn backend.main:app --host 0.0.0.0 --port 8000
