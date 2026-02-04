# Phase IV — Backend (FastAPI + SQLModel + OpenAI Agents)
# Evolution of Todo — Hackathon II

FROM python:3.13-slim

WORKDIR /app

# Install dependencies
COPY pyproject.toml ./
RUN pip install --no-cache-dir -e .

COPY backend/ ./backend/

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
