# Phase III — Task tools for AI agent (MCP-compatible signatures)
# [From]: Hackathon Phase III MCP Tools spec — add_task, list_tasks, complete_task, delete_task, update_task

from datetime import datetime, timedelta

from sqlmodel import Session, select, col

from backend.database import engine
from backend.models import Task


def add_task(
    user_id: str,
    title: str,
    description: str = "",
    priority: str = "medium",
    tags: str | None = None,
    due_date: str | None = None,
    recurring_rule: str | None = None,
) -> dict:
    """Create a new task.
    Args:
        user_id: Owner ID.
        title: Task title.
        description: Optional details.
        priority: 'low', 'medium', 'high'.
        tags: Comma-separated strings.
        due_date: ISO datetime string.
        recurring_rule: 'daily', 'weekly', 'monthly'.
    """
    with Session(engine) as session:
        title = (title or "").strip()
        description = (description or "").strip()
        if len(title) < 1 or len(title) > 200:
            return {"error": "Title must be 1–200 characters"}
        if len(description) > 1000:
            return {"error": "Description max 1000 characters"}
        
        valid_priorities = ["low", "medium", "high"]
        if priority not in valid_priorities:
            priority = "medium"
            
        dt_due = None
        if due_date:
            try:
                dt_due = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            except ValueError:
                return {"error": "Invalid due_date format. Use ISO 8601."}

        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            priority=priority,
            tags=tags,
            due_date=dt_due,
            recurring_rule=recurring_rule,
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return {
            "task_id": task.id,
            "status": "created",
            "title": task.title,
            "priority": task.priority,
            "due_date": task.due_date.isoformat() if task.due_date else None,
        }


def list_tasks(
    user_id: str,
    status: str = "all",
    priority: str | None = None,
    tag: str | None = None,
    search: str | None = None
) -> list[dict]:
    """Retrieve tasks with optional filtering."""
    with Session(engine) as session:
        query = select(Task).where(Task.user_id == user_id)
        
        if status == "pending":
            query = query.where(Task.completed == False)
        elif status == "completed":
            query = query.where(Task.completed == True)
            
        if priority:
            query = query.where(Task.priority == priority)
            
        if tag:
            # Simple string containment for tags stored as "a,b,c"
            query = query.where(col(Task.tags).contains(tag))
            
        if search:
            # Case-insensitive search
            query = query.where(
                col(Task.title).contains(search) | col(Task.description).contains(search)
            )

        query = query.order_by(Task.id)
        tasks = session.exec(query).all()
        
        return [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "completed": t.completed,
                "priority": t.priority,
                "tags": t.tags,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "recurring_rule": t.recurring_rule,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in tasks
        ]


def complete_task(user_id: str, task_id: int) -> dict:
    """Mark a task as complete. Handles recurring tasks."""
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return {"error": "Task not found"}
        
        if task.completed:
            # Already completed, just return
            return {"task_id": task.id, "status": "already_completed", "title": task.title}

        task.completed = True
        task.updated_at = datetime.utcnow()
        session.add(task)
        
        next_task_info = None
        
        # Handle Recurring Logic
        if task.recurring_rule and task.due_date:
            next_due = None
            if task.recurring_rule == "daily":
                next_due = task.due_date + timedelta(days=1)
            elif task.recurring_rule == "weekly":
                next_due = task.due_date + timedelta(weeks=1)
            elif task.recurring_rule == "monthly":
                next_due = task.due_date + timedelta(days=30) # Approx
            
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
                session.commit() # Commit to get ID
                next_task_info = {"next_task_id": new_task.id, "next_due_date": next_due.isoformat()}
            else:
                session.commit()
        else:
            session.commit()
            
        session.refresh(task)
        
        result = {
            "task_id": task.id,
            "status": "completed",
            "title": task.title,
        }
        if next_task_info:
            result.update(next_task_info)
        return result


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


def update_task(
    user_id: str,
    task_id: int,
    title: str | None = None,
    description: str | None = None,
    priority: str | None = None,
    tags: str | None = None,
    due_date: str | None = None,
    recurring_rule: str | None = None
) -> dict:
    """Modify task details."""
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
            
        if priority is not None:
            if priority in ["low", "medium", "high"]:
                task.priority = priority
                
        if tags is not None:
            task.tags = tags
            
        if due_date is not None:
            try:
                task.due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            except ValueError:
                return {"error": "Invalid due_date format"}
                
        if recurring_rule is not None:
            if recurring_rule in ["daily", "weekly", "monthly", ""]:
                task.recurring_rule = recurring_rule if recurring_rule else None

        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
        return {
            "task_id": task.id,
            "status": "updated",
            "title": task.title,
            "priority": task.priority,
            "due_date": task.due_date.isoformat() if task.due_date else None,
        }
