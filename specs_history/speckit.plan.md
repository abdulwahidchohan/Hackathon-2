# Plan — Phase I In-Memory Console App

**Source:** speckit.specify, specs/architecture.md

## Approach

Single-process Python application. CLI parses arguments and calls a todo store. Store holds a list of tasks in memory. No DB, no network.

## Components

1. **Task model** — Dataclass or named tuple: id, title, description, completed, created_at. Validation: title 1–200 chars, description 0–1000 chars.
2. **Todo store** — In-memory list; next_id counter. Methods: add(title, description?), list_all(), get(id), update(id, title?, description?), delete(id), complete(id). Return task or raise/return error for missing ID.
3. **CLI** — Subcommands: add, list, update, delete, complete. Use argparse (stdlib). add: --title required, --description optional. list: no args. update/delete/complete: positional id, update also --title/--description. Print results and errors to stdout/stderr.

## Sequencing

1. Define Task model and validation.
2. Implement store (add, list, get, update, delete, complete).
3. Implement CLI (argparse, dispatch to store, format output).
4. Wire entry point (todo.cli:main).

## Artifacts

- `src/todo/models.py` — Task (or task representation).
- `src/todo/store.py` — In-memory store.
- `src/todo/cli.py` — Argument parsing and main().
