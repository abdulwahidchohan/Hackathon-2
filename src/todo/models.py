# [Task]: T-001
# [From]: specs/features/task-crud.md §Create Task, Domain rules; specs_history/speckit.tasks.md

from dataclasses import dataclass
from datetime import datetime

TITLE_MIN = 1
TITLE_MAX = 200
DESCRIPTION_MAX = 1000


@dataclass
class Task:
    """Single todo item. id, title, description, completed, created_at."""

    id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
    priority: str = "medium"
    tags: list[str] | None = None
    due_date: datetime | None = None
    recurring_rule: str | None = None

    @staticmethod
    def validate_title(title: str) -> None:
        if not isinstance(title, str):
            raise ValueError("Title must be a string")
        t = title.strip()
        if len(t) < TITLE_MIN or len(t) > TITLE_MAX:
            raise ValueError(f"Title must be {TITLE_MIN}-{TITLE_MAX} characters")
        return None

    @staticmethod
    def validate_description(description: str | None) -> str:
        if description is None:
            return ""
        if not isinstance(description, str):
            raise ValueError("Description must be a string or None")
        d = description.strip()
        if len(d) > DESCRIPTION_MAX:
            raise ValueError(f"Description must be at most {DESCRIPTION_MAX} characters")
        return d
    
    @staticmethod
    def validate_priority(priority: str) -> str:
        if priority not in ["low", "medium", "high"]:
            raise ValueError("Priority must be 'low', 'medium', or 'high'")
        return priority
    
    @staticmethod
    def validate_recurring_rule(rule: str | None) -> str | None:
        if rule and rule not in ["daily", "weekly", "monthly"]:
             raise ValueError("Recurring rule must be 'daily', 'weekly', or 'monthly'")
        return rule
