# Phase II — Task CRUD + complete API
# [From]: specs/features/task-crud.md, GET/POST /api/{user_id}/tasks, etc.

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, Path, status
from pydantic import BaseModel
from sqlmodel import Session, select

from backend.auth import get_current_user_id
from backend.database import get_session
from backend.models import Task

router = APIRouter(tags=["tasks"])


class CreateTaskBody(BaseModel):
    title: str
    description: str = ""


class UpdateTaskBody(BaseModel):
    title: str | None = None
    description: str | None = None


def require_user_match(
    user_id: str = Path(..., alias="user_id"),
    current_id: Annotated[str, Depends(get_current_user_id)] = None,
) -> str:
    if current_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID in path does not match authenticated user",
        )
    return user_id


@router.get("/{user_id}/tasks")
def list_tasks(
    user_id: Annotated[str, Depends(require_user_match)],
    session: Annotated[Session, Depends(get_session)],
):
    stmt = select(Task).where(Task.user_id == user_id).order_by(Task.id)
    tasks = list(session.exec(stmt).all())
    return tasks


@router.post("/{user_id}/tasks")
def create_task(
    user_id: Annotated[str, Depends(require_user_match)],
    session: Annotated[Session, Depends(get_session)],
    body: CreateTaskBody,
):
    title = (body.title or "").strip()
    description = (body.description or "").strip()
    if len(title) < 1 or len(title) > 200:
        raise HTTPException(status_code=400, detail="Title must be 1–200 characters")
    if len(description) > 1000:
        raise HTTPException(status_code=400, detail="Description max 1000 characters")
    task = Task(user_id=user_id, title=title, description=description)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.get("/{user_id}/tasks/{task_id:int}")
def get_task(
    user_id: Annotated[str, Depends(require_user_match)],
    task_id: int,
    session: Annotated[Session, Depends(get_session)],
):
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{user_id}/tasks/{task_id:int}")
def update_task(
    user_id: Annotated[str, Depends(require_user_match)],
    task_id: int,
    session: Annotated[Session, Depends(get_session)],
    body: UpdateTaskBody,
):
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    if body.title is not None:
        t = body.title.strip()
        if len(t) < 1 or len(t) > 200:
            raise HTTPException(status_code=400, detail="Title must be 1–200 characters")
        task.title = t
    if body.description is not None:
        if len(body.description) > 1000:
            raise HTTPException(status_code=400, detail="Description max 1000 characters")
        task.description = body.description.strip()
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/{user_id}/tasks/{task_id:int}")
def delete_task(
    user_id: Annotated[str, Depends(require_user_match)],
    task_id: int,
    session: Annotated[Session, Depends(get_session)],
):
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.commit()
    return {"ok": True, "id": task_id}


@router.patch("/{user_id}/tasks/{task_id:int}/complete")
def toggle_complete(
    user_id: Annotated[str, Depends(require_user_match)],
    task_id: int,
    session: Annotated[Session, Depends(get_session)],
):
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
