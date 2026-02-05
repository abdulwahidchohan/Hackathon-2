# REST API Specification (Advanced)

## Base URL
- Development: http://localhost:8000
- Production: https://api.todo-evolution.com

## Authentication
- **Header**: `Authorization: Bearer <token>` (JWT)
- **Role**: Better Auth handles user sessions.

## Endpoints

### Tasks

#### GET /api/{user_id}/tasks
List tasks with advanced filtering.
- **Query Params**:
  - `status`: "all" | "pending" | "completed"
  - `priority`: "low" | "medium" | "high"
  - `tag`: string (partial match)
  - `search`: string (matches title/desc)
  - `sort`: "due_date" | "priority" | "created_at"
- **Response**: List of Task objects including `priority`, `tags`, `due_date`, `recurring_rule`.

#### POST /api/{user_id}/tasks
Create a new task.
- **Body**:
  - `title`: string (required)
  - `description`: string
  - `priority`: "low" | "medium" | "high" (default: medium)
  - `tags`: string (comma-separated)
  - `due_date`: ISO 8601 string
  - `recurring_rule`: "daily" | "weekly" | "monthly"

#### PUT /api/{user_id}/tasks/{task_id}
Update task details.
- **Body**: Same as POST (all optional).

#### DELETE /api/{user_id}/tasks/{task_id}
Delete a task.

#### PATCH /api/{user_id}/tasks/{task_id}/complete
Toggle completion status.
- **Logic**: If `recurring_rule` is set, completion triggers creation of the next instance.

### Chat

#### POST /api/{user_id}/chat
Interact with the AI Agent.
- **Body**: `{ "message": "...", "conversation_id": 123 }`
- **Response**: `{ "response": "AI reply...", "tool_calls": [...] }`
