# Evolution of Todo — Hackathon II

A spec-driven todo application that evolves from a console app (Phase I) to a cloud-native AI chatbot. This repository follows **Spec-Driven Development** using Claude Code and Spec-Kit Plus.

**Hackathon:** [Hackathon II – Todo Spec-Driven Development](https://github.com/panaversity/spec-kit-plus) (Panaversity / PIAIC / GIAIC).

## Current Phase: Phase II — Full-Stack Web Application

Phase I (in-memory console app) is complete. Phase II adds a full-stack web app: Next.js 16+ frontend, FastAPI backend, SQLModel + Neon PostgreSQL, Better Auth (JWT). All five basic features (Add, Delete, Update, View List, Mark Complete) are available in the web UI with user signup/signin.

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

### Phase II — Full-stack web app

1. **Backend** (FastAPI + Neon + JWT):
   ```bash
   cd backend
   uv sync   # or: pip install -e .
   # Set DATABASE_URL and BETTER_AUTH_SECRET (see backend/README.md)
   uvicorn backend.main:app --reload --port 8000
   ```
2. **Frontend** (Next.js + Better Auth):
   ```bash
   cd frontend
   npm install
   # Set BETTER_AUTH_SECRET and NEXT_PUBLIC_API_URL (see frontend/README.md)
   npm run dev
   ```
   Open http://localhost:3000 — sign up, sign in, then use the task list.

## Project structure

| Path | Purpose |
|------|---------|
| `specs/` | Spec-Kit managed specifications (constitution, overview, architecture, features) |
| `specs_history/` | History of specification files (deliverable) |
| `src/todo/` | Phase I Python console application |
| `frontend/` | Phase II Next.js app (Better Auth, task UI) |
| `backend/` | Phase II FastAPI app (SQLModel, Neon, JWT) |
| `AGENTS.md` | Spec-driven workflow for all AI agents |
| `CLAUDE.md` | Claude Code entry (references AGENTS.md) |

## Phases (roadmap)

| Phase | Description |
|-------|-------------|
| **I** | In-memory Python console app (done) |
| **II** | Full-stack web app (Next.js, FastAPI, Neon, Better Auth) — done |
| **III** | AI-powered todo chatbot (OpenAI ChatKit, Agents SDK, MCP) |
| **IV** | Local Kubernetes deployment (Docker, Minikube, Helm) |
| **V** | Cloud deployment (Kafka, Dapr, DOKS/AKS/GKE) |

## License

See repository license.
