# Phase II — Neon PostgreSQL + SQLModel
# [From]: specs (Phase II API, database)

import os
from sqlmodel import Session, create_engine, SQLModel

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://user:pass@localhost:5432/todo",
)
engine = create_engine(DATABASE_URL, echo=os.environ.get("SQL_ECHO", "").lower() == "1")


def get_session():
    with Session(engine) as session:
        yield session


def init_db():
    from backend.models import Task  # noqa: F401 — register table
    SQLModel.metadata.create_all(engine)
