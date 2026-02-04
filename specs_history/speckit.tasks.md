# Tasks — Phase I Implementation

**From:** speckit.specify §Requirements, speckit.plan §Components

## T-001 — Project skeleton and Task model

- **Description:** Create `src/todo/` package with `__init__.py`. Add `models.py` with a Task representation (id, title, description, completed, created_at) and validation (title 1–200 chars, description 0–1000 chars).
- **Preconditions:** pyproject.toml exists with package `todo` in src/todo.
- **Outputs:** `src/todo/__init__.py`, `src/todo/models.py`.
- **Spec:** task-crud.md (Create Task, Domain rules).

## T-002 — In-memory todo store

- **Description:** Implement `store.py` with an in-memory store: add(title, description?), list_all(), get(id), update(id, title?, description?), delete(id), complete(id). Use incremental ID. Raise or return clear error for missing ID.
- **Preconditions:** T-001 done (Task model exists).
- **Outputs:** `src/todo/store.py`.
- **Spec:** task-crud.md (all operations), architecture.md (Store API).

## T-003 — CLI: add and list

- **Description:** In `cli.py`, add argparse subcommands `add` (--title required, --description optional) and `list`. Wire to store; print confirmation for add and formatted list for list.
- **Preconditions:** T-002 done.
- **Outputs:** `src/todo/cli.py` (partial).
- **Spec:** task-crud.md (Create Task, View Task List).

## T-004 — CLI: update, delete, complete

- **Description:** Add subcommands `update` (positional id, --title, --description), `delete` (positional id), `complete` (positional id). Wire to store; print success or "Task not found" (or equivalent).
- **Preconditions:** T-003 done.
- **Outputs:** `src/todo/cli.py` (complete).
- **Spec:** task-crud.md (Update, Delete, Mark as Complete).

## T-005 — Entry point and README

- **Description:** Ensure `main()` in cli.py is the entry point (pyproject.toml script `todo = todo.cli:main`). Verify README run instructions (uv run python -m todo / uv run todo).
- **Preconditions:** T-004 done.
- **Outputs:** Working `uv run todo` and README accurate.
- **Spec:** architecture.md (CLI entrypoint), README.md.
