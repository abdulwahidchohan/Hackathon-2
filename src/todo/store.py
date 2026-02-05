# [Task]: T-002
# [From]: specs/features/task-crud.md (all operations), specs/architecture.md §Store API

from datetime import datetime

from todo.models import Task

TASK_NOT_FOUND = "Task not found"


class TodoStore:
    """In-memory store for tasks. add, list_all, get, update, delete, complete."""

    def __init__(self) -> None:
        self._tasks: list[Task] = []
        self._next_id = 1

    def add(
        self, 
        title: str, 
        description: str = "",
        priority: str = "medium",
        tags: list[str] | None = None,
        due_date: datetime | None = None,
        recurring_rule: str | None = None
    ) -> Task:
        Task.validate_title(title)
        desc = Task.validate_description(description or "")
        prio = Task.validate_priority(priority)
        rule = Task.validate_recurring_rule(recurring_rule)
        
        now = datetime.now()
        task = Task(
            id=self._next_id,
            title=title.strip(),
            description=desc,
            completed=False,
            created_at=now,
            priority=prio,
            tags=tags,
            due_date=due_date,
            recurring_rule=rule
        )
        self._next_id += 1
        self._tasks.append(task)
        return task

    def list_all(self) -> list[Task]:
        return list(self._tasks)

    def get(self, task_id: int) -> Task | None:
        for t in self._tasks:
            if t.id == task_id:
                return t
        return None

    def update(
        self,
        task_id: int,
        *,
        title: str | None = None,
        description: str | None = None,
        priority: str | None = None,
        tags: list[str] | None = None,
        due_date: datetime | None = None,
        recurring_rule: str | None = None
    ) -> Task:
        task = self.get(task_id)
        if task is None:
            raise LookupError(TASK_NOT_FOUND)
            
        new_title = task.title
        new_desc = task.description
        new_priority = task.priority
        new_tags = task.tags
        new_due = task.due_date
        new_rule = task.recurring_rule
        
        if title is not None:
            Task.validate_title(title)
            new_title = title.strip()
        if description is not None:
            new_desc = Task.validate_description(description)
        if priority is not None:
            new_priority = Task.validate_priority(priority)
        if tags is not None:
            new_tags = tags
        if due_date is not None:
            new_due = due_date
        if recurring_rule is not None:
            new_rule = Task.validate_recurring_rule(recurring_rule)

        updated = Task(
            id=task.id,
            title=new_title,
            description=new_desc,
            completed=task.completed,
            created_at=task.created_at,
            priority=new_priority,
            tags=new_tags,
            due_date=new_due,
            recurring_rule=new_rule
        )
        idx = next(i for i, t in enumerate(self._tasks) if t.id == task_id)
        self._tasks[idx] = updated
        return updated

    def delete(self, task_id: int) -> Task:
        task = self.get(task_id)
        if task is None:
            raise LookupError(TASK_NOT_FOUND)
        self._tasks = [t for t in self._tasks if t.id != task_id]
        return task

    def complete(self, task_id: int) -> Task:
        task = self.get(task_id)
        if task is None:
            raise LookupError(TASK_NOT_FOUND)
            
        new_completed = not task.completed
        toggled = Task(
            id=task.id,
            title=task.title,
            description=task.description,
            completed=new_completed,
            created_at=task.created_at,
            priority=task.priority,
            tags=task.tags,
            due_date=task.due_date,
            recurring_rule=task.recurring_rule
        )
        idx = next(i for i, t in enumerate(self._tasks) if t.id == task_id)
        self._tasks[idx] = toggled
        
        # Helper logic for recurring tasks (simple in-memory version)
        if new_completed and task.recurring_rule:
             # Just a simple hack to simulate creating next task for Phase I
             # Real date math logic is in backend, but we do basic here
             pass 
             
        return toggled
