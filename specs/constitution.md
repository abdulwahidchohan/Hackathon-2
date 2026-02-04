# Constitution — Evolution of Todo (Hackathon II)

This document is the single source of truth for **why** and **non-negotiables**. All agents and developers must check this before proposing solutions.

## Principles

1. **Spec-driven only.** No code may be written without a corresponding Task ID and spec reference. Implementation follows the lifecycle: Specify → Plan → Tasks → Implement.

2. **Python 3.13+ and UV.** Phase I uses Python 3.13 or newer. Package and environment management use UV. No manual pip/venv for Phase I.

3. **Clean code and structure.** Follow standard Python project layout (e.g. `src/<package>/`). Use clear names, minimal dependencies for Phase I, and no implementation that is not authorized by a task.

4. **Single source of truth.** Requirements live in specs; architecture in the plan; work units in tasks. Do not infer or invent requirements—update the spec or request clarification.

5. **Phase I scope.** Phase I is an in-memory console application only: no database, no web stack, no external services. Storage is in-process only.

## Constraints

- **Phase I tech stack:** UV, Python 3.13+, Claude Code, Spec-Kit Plus. No FastAPI, Neon, or Next.js in Phase I.
- **Phase I features:** Exactly the five basic features: Add Task, Delete Task, Update Task, View Task List, Mark as Complete. No priorities, tags, due dates, or recurring tasks in Phase I.
- **No manual coding without a task.** All implementation must be traceable to a task and spec. Refine the spec until the agent produces the correct output; do not write code by hand to “fix” spec gaps.

## Out of Scope (Phase I)

- Authentication, multi-user, or persistence to disk/database.
- Web UI, REST API, or any network service.
- AI chatbot, MCP, or agents beyond using Claude Code for implementation from specs.
