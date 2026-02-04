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

    def add(self, title: str, description: str = "") -> Task:
        Task.validate_title(title)
        desc = Task.validate_description(description or "")
        now = datetime.now()
        task = Task(
            id=self._next_id,
            title=title.strip(),
            description=desc,
            completed=False,
            created_at=now,
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
    ) -> Task:
        task = self.get(task_id)
        if task is None:
            raise LookupError(TASK_NOT_FOUND)
        new_title = task.title
        new_desc = task.description
        if title is not None:
            Task.validate_title(title)
            new_title = title.strip()
        if description is not None:
            new_desc = Task.validate_description(description)
        updated = Task(
            id=task.id,
            title=new_title,
            description=new_desc,
            completed=task.completed,
            created_at=task.created_at,
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
        toggled = Task(
            id=task.id,
            title=task.title,
            description=task.description,
            completed=not task.completed,
            created_at=task.created_at,
        )
        idx = next(i for i, t in enumerate(self._tasks) if t.id == task_id)
        self._tasks[idx] = toggled
        return toggled
