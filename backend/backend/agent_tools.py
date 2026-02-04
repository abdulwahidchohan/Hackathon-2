# Phase III — Task tools for AI agent (MCP-compatible signatures)
# [From]: Hackathon Phase III MCP Tools spec — add_task, list_tasks, complete_task, delete_task, update_task

from datetime import datetime

from sqlmodel import Session, select

from backend.database import engine
from backend.models import Task


def add_task(user_id: str, title: str, description: str = "") -> dict:
    """Create a new task. Requires user_id and title; description is optional."""
    with Session(engine) as session:
        title = (title or "").strip()
        description = (description or "").strip()
        if len(title) < 1 or len(title) > 200:
            return {"error": "Title must be 1–200 characters"}
        if len(description) > 1000:
            return {"error": "Description max 1000 characters"}
        task = Task(user_id=user_id, title=title, description=description)
        session.add(task)
        session.commit()
        session.refresh(task)
        return {"task_id": task.id, "status": "created", "title": task.title}


def list_tasks(user_id: str, status: str = "all") -> list[dict]:
    """Retrieve tasks. status: 'all' | 'pending' | 'completed'."""
    with Session(engine) as session:
        stmt = select(Task).where(Task.user_id == user_id).order_by(Task.id)
        tasks = list(session.exec(stmt).all())
        if status == "pending":
            tasks = [t for t in tasks if not t.completed]
        elif status == "completed":
            tasks = [t for t in tasks if t.completed]
        return [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "completed": t.completed,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in tasks
        ]


def complete_task(user_id: str, task_id: int) -> dict:
    """Mark a task as complete (toggle)."""
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return {"error": "Task not found"}
        task.completed = not task.completed
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
        return {"task_id": task.id, "status": "completed" if task.completed else "incomplete", "title": task.title}


def delete_task(user_id: str, task_id: int) -> dict:
    """Remove a task from the list."""
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return {"error": "Task not found"}
        title = task.title
        session.delete(task)
        session.commit()
        return {"task_id": task_id, "status": "deleted", "title": title}


def update_task(user_id: str, task_id: int, title: str | None = None, description: str | None = None) -> dict:
    """Modify task title or description."""
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return {"error": "Task not found"}
        if title is not None:
            t = title.strip()
            if len(t) < 1 or len(t) > 200:
                return {"error": "Title must be 1–200 characters"}
            task.title = t
        if description is not None:
            if len(description) > 1000:
                return {"error": "Description max 1000 characters"}
            task.description = description
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
        return {"task_id": task.id, "status": "updated", "title": task.title}
