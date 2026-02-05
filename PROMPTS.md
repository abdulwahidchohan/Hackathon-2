# Claude Code Prompt History

This log documents the Spec-Driven Development sessions used to build the Evolution of Todo application.

## Phase I: In-Memory Console App (Basic)
**Date**: Dec 1, 2025
**Spec**: `@specs/features/task-crud.md` (Basic)

```bash
> claude "Read @specs/features/task-crud.md and implement the text-based console app in src/todo. Use the `Task` dataclass and a `TodoStore` class."
> claude "Add a CLI entry point in src/todo/cli.py to handle add, list, update, delete commands."
```

## Phase II: Full-Stack Web App (Advanced)
**Date**: Dec 14, 2025
**Specs**: `@specs/api/rest-endpoints.md`, `@specs/database/schema.md`

```bash
> claude "Initialize a FastAPI project in backend/. Use SQLModel for the database."
> claude "Implement the Database Schema from @specs/database/schema.md including the User, Task, Conversation, and Message models."
> claude "Create the REST API endpoints defined in @specs/api/rest-endpoints.md. Ensure JWT authentication is enforced."
> claude "Update the Task model to support Advanced features: Priority, Tags, DueDate, and RecurringRule."
```

## Phase III: AI Chatbot (Advanced)
**Date**: Dec 21, 2025
**Spec**: `@specs/features/chatbot.md`

```bash
> claude "Implement the AI Chatbot endpoint POST /api/chat as described in @specs/features/chatbot.md."
> claude "Create a file backend/agent_tools.py implementing MCP-compatible tools for task management."
> claude "Ensure agent tools support the Advanced features (priority, tags, etc.) and map them to the database."
> claude "Add logic to `complete_task` to automatically create the next instance if a task is recurring."
```

## Phase IV: Kubernetes Deployment
**Date**: Jan 4, 2026
**Spec**: `helm/README.md`

```bash
> claude "Create a Dockerfile for the backend and frontend."
> claude "Generate a Helm chart in helm/evolution-todo for deploying the full stack on Minikube."
```

## Phase V: Cloud Native (Event-Driven)
**Date**: Jan 18, 2026
**Spec**: `@specs/deployment/phase5-cloud.md`

```bash
> claude "Design the Event-Driven architecture using Dapr and Kafka."
> claude "Create the spec @specs/deployment/phase5-cloud.md detailing the Pub/Sub flow for task events."
```
