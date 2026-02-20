# Phase II — Task CRUD + complete API
# [From]: specs/features/task-crud.md, GET/POST /api/{user_id}/tasks, etc.

from datetime import datetime, timedelta
import json
from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select, col

from dapr.clients import DaprClient

from backend.auth import get_current_user_id
from backend.database import get_session
from backend.models import Task

router = APIRouter(prefix="/api", tags=["tasks"])


class CreateTaskBody(BaseModel):
    title: str
    description: str = ""
    priority: str = "medium"
    tags: str | None = None
    due_date: str | None = None
    recurring_rule: str | None = None


class UpdateTaskBody(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: str | None = None
    tags: str | None = None
    due_date: str | None = None
    recurring_rule: str | None = None


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
    status: str | None = Query(None),
    priority: str | None = Query(None),
    tag: str | None = Query(None),
    search: str | None = Query(None),
):
    stmt = select(Task).where(Task.user_id == user_id)
    
    if status == "pending":
        stmt = stmt.where(Task.completed == False)
    elif status == "completed":
        stmt = stmt.where(Task.completed == True)
        
    if priority:
        stmt = stmt.where(Task.priority == priority)
        
    if tag:
        stmt = stmt.where(col(Task.tags).contains(tag))
        
    if search:
        stmt = stmt.where(
            col(Task.title).contains(search) | col(Task.description).contains(search)
        )
        
    stmt = stmt.order_by(Task.id)
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
    
    if body.priority not in ["low", "medium", "high"]:
        body.priority = "medium"
        
    dt_due = None
    if body.due_date:
        try:
            dt_due = datetime.fromisoformat(body.due_date.replace("Z", "+00:00"))
        except ValueError:
             raise HTTPException(status_code=400, detail="Invalid due_date format. Use ISO 8601.")

    task = Task(
        user_id=user_id, 
        title=title, 
        description=description,
        priority=body.priority,
        tags=body.tags,
        due_date=dt_due,
        recurring_rule=body.recurring_rule
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    # Phase V: Publish Event
    try:
        with DaprClient() as d:
            d.publish_event(
                pubsub_name="kafka-pubsub",
                topic_name="task-events",
                data=json.dumps({"event": "created", "task_id": task.id, "title": task.title}),
                data_content_type="application/json",
            )
    except Exception as e:
        print(f"Warning: Failed to publish event: {e}")

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
        
    if body.priority is not None:
        if body.priority in ["low", "medium", "high"]:
            task.priority = body.priority
            
    if body.tags is not None:
        task.tags = body.tags
        
    if body.due_date is not None:
        try:
            task.due_date = datetime.fromisoformat(body.due_date.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid due_date format.")
            
    if body.recurring_rule is not None:
         task.recurring_rule = body.recurring_rule if body.recurring_rule else None

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
    
    if task.completed:
         # Already completed, just toggle back to incomplete
         task.completed = False
         task.updated_at = datetime.utcnow()
         session.add(task)
         session.commit()
         session.refresh(task)
         return task
         
    # Mark complete
    task.completed = True
    task.updated_at = datetime.utcnow()
    session.add(task)
    
    # Recurring Logic matched from agent_tools
    if task.recurring_rule and task.due_date:
        next_due = None
        if task.recurring_rule == "daily":
            next_due = task.due_date + timedelta(days=1)
        elif task.recurring_rule == "weekly":
            next_due = task.due_date + timedelta(weeks=1)
        elif task.recurring_rule == "monthly":
            next_due = task.due_date + timedelta(days=30) 
        
        if next_due:
            new_task = Task(
                user_id=user_id,
                title=task.title,
                description=task.description,
                priority=task.priority,
                tags=task.tags,
                recurring_rule=task.recurring_rule,
                due_date=next_due,
                completed=False
            )
            session.add(new_task)
    
    session.commit()
    session.refresh(task)

    if task.completed:
        try:
            with DaprClient() as d:
                d.publish_event(
                    pubsub_name="kafka-pubsub",
                    topic_name="task-events",
                    data=json.dumps({"event": "completed", "task_id": task.id, "title": task.title}),
                    data_content_type="application/json",
                )
        except Exception as e:
             print(f"Warning: Failed to publish event: {e}")

    return task
