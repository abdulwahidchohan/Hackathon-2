# Evolution of Todo — Hackathon II

A spec-driven todo application that evolves from a console app (Phase I) to a cloud-native AI chatbot. This repository follows **Spec-Driven Development** using Claude Code and Spec-Kit Plus.

**Hackathon:** [Hackathon II – Todo Spec-Driven Development](https://github.com/panaversity/spec-kit-plus) (Panaversity / PIAIC / GIAIC).

## Current Phase: Phase I — In-Memory Python Console App

Phase I delivers a command-line todo application that stores tasks in memory. All five basic features are implemented: Add Task, Delete Task, Update Task, View Task List, Mark as Complete.

## Setup

### Prerequisites

- **Python 3.13+**
- **UV** — [Install UV](https://docs.astral.sh/uv/)

### Install and run (Phase I)

```bash
# From repository root
uv sync
uv run python -m todo
```

Or with explicit commands:

```bash
uv run todo add "My first task" --description "Optional description"
uv run todo list
uv run todo update 1 --title "Updated title"
uv run todo complete 1
uv run todo delete 1
```

**Without UV:** From the repo root, set `PYTHONPATH=src` (e.g. `$env:PYTHONPATH="src"` in PowerShell, `export PYTHONPATH=src` on Unix) and run:

```bash
python -m todo.cli list
python -m todo.cli add "My first task" -d "Optional description"
# etc.
```

### Spec-Kit / UV commands

- Sync dependencies: `uv sync`
- Run the app: `uv run python -m todo` or `uv run todo`
- Add a dev dependency: `uv add --dev <package>`

## Project structure

| Path | Purpose |
|------|---------|
| `specs/` | Spec-Kit managed specifications (constitution, overview, architecture, features) |
| `specs_history/` | History of specification files (deliverable) |
| `src/todo/` | Phase I Python console application |
| `frontend/` | Phase II+ (Next.js) — reserved |
| `backend/` | Phase II+ (FastAPI) — reserved |
| `AGENTS.md` | Spec-driven workflow for all AI agents |
| `CLAUDE.md` | Claude Code entry (references AGENTS.md) |

## Phases (roadmap)

| Phase | Description |
|-------|-------------|
| **I** | In-memory Python console app (current) |
| **II** | Full-stack web app (Next.js, FastAPI, Neon, Better Auth) |
| **III** | AI-powered todo chatbot (OpenAI ChatKit, Agents SDK, MCP) |
| **IV** | Local Kubernetes deployment (Docker, Minikube, Helm) |
| **V** | Cloud deployment (Kafka, Dapr, DOKS/AKS/GKE) |

## License

See repository license.
