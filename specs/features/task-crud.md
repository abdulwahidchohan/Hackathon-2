# Feature: Task CRUD Operations (Advanced Level)

## User stories

### Basic
- As a user, I can create a new task (with title and optional description).
- As a user, I can view all my tasks with their status.
- As a user, I can update a task’s title and/or description.
- As a user, I can delete a task by ID.
- As a user, I can mark a task as complete or incomplete by ID.

### Intermediate (Organization & Usability)
- As a user, I can assign a priority (low, medium, high) to a task.
- As a user, I can add tags/categories (e.g., "work", "home") to a task.
- As a user, I can search for tasks by keyword in title or description.
- As a user, I can filter tasks by status, priority, or tags.
- As a user, I can sort tasks by due date or priority.

### Advanced (Intelligent Features)
- As a user, I can set a due date and time for a task.
- As a user, I can create recurring tasks (e.g., "daily", "weekly", "monthly").

## Acceptance criteria

### Create/Update Task (Advanced)
- User can optionally provide `priority`: "low", "medium", "high" (default: "medium").
- User can optionally provide `tags`: list of strings.
- User can optionally provide `due_date`: datetime string.
- User can optionally provide `recurring_rule`: string (e.g., "daily", "weekly").
- Validation:
    - Priority must be one of allowed values.
    - Due date must be a valid datetime.

### View/Search/Filter (Advanced)
- API/Tools support `search` parameter (matches title/description).
- API/Tools support `priority` filter.
- API/Tools support `tags` filter.
- List output includes priority, tags, and due date.

### Recurring Logic
- If a task with a `recurring_rule` is marked completed, the system should automatically create the next instance of the task based on the rule.

