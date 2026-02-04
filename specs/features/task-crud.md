# Feature: Task CRUD Operations (Phase I)

## User stories

- As a user, I can create a new task (with title and optional description).
- As a user, I can view all my tasks with their status.
- As a user, I can update a task’s title and/or description.
- As a user, I can delete a task by ID.
- As a user, I can mark a task as complete or incomplete by ID.

## Acceptance criteria

### Create Task (Add)

- Title is required; length 1–200 characters.
- Description is optional; max 1000 characters if present.
- Task is stored in memory and gets a unique ID.
- User receives confirmation (e.g. ID and title).

### View Task List

- All tasks are listed.
- Each task shows: ID, title, description (if any), completed status, and optionally created_at.
- Empty list is shown as a clear message when there are no tasks.

### Update Task

- User specifies task by ID.
- At least one of title or description may be provided; the other remains unchanged.
- Title, if provided: 1–200 characters. Description, if provided: max 1000 characters.
- If task ID does not exist, show a clear error (e.g. “Task not found”).

### Delete Task

- User specifies task by ID.
- Task is removed from the store.
- If task ID does not exist, show a clear error (e.g. “Task not found”).

### Mark as Complete

- User specifies task by ID.
- Completed flag is toggled (false → true or true → false).
- If task ID does not exist, show a clear error (e.g. “Task not found”).

## Domain rules

- IDs are opaque to the user but stable for the session (e.g. integer, auto-increment).
- Storage is in-memory only; no persistence across runs.
- One logical “store” per process (single user, single list for Phase I).

## Constraints

- See `specs/constitution.md` for tech stack and Phase I scope.
