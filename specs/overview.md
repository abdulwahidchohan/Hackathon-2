# Todo App Overview

## Purpose

A todo application that evolves from a console app (Phase I) to a cloud-native AI chatbot. Built using Spec-Driven Development with Claude Code and Spec-Kit Plus.

## Current Phase

**Phase I: In-Memory Python Console App**

Command-line application storing tasks in memory. No database or web stack.

## Tech Stack (Phase I)

- **Runtime:** Python 3.13+
- **Tooling:** UV (package/env management)
- **Process:** Claude Code, Spec-Kit Plus
- **Storage:** In-memory only

## Features (Phase I — Basic Level)

- [x] Add Task — Create new todo items (title required, description optional)
- [x] Delete Task — Remove tasks by ID
- [x] Update Task — Modify title and/or description by ID
- [x] View Task List — Display all tasks with status
- [x] Mark as Complete — Toggle completion by ID

## Roadmap

| Phase | Focus |
|-------|--------|
| I | In-memory CLI (current) |
| II | Full-stack web (Next.js, FastAPI, Neon, Better Auth) |
| III | AI chatbot (OpenAI ChatKit, Agents SDK, MCP) |
| IV | Local K8s (Docker, Minikube, Helm) |
| V | Cloud + advanced (Kafka, Dapr, DOKS/AKS/GKE) |

## Spec References

- **Constitution:** `specs/constitution.md`
- **Architecture:** `specs/architecture.md`
- **Feature (task CRUD):** `specs/features/task-crud.md`
