# Evolution of Todo — Backend (Phase II)

FastAPI + SQLModel + Neon PostgreSQL. JWT auth via Better Auth (shared secret).

## Setup

```bash
cd backend
uv sync   # or: pip install -e .
```

## Environment

- `DATABASE_URL` — Neon PostgreSQL connection string (e.g. `postgresql://user:pass@host/db?sslmode=require`)
- `BETTER_AUTH_SECRET` — Same secret as frontend Better Auth (JWT signing)

## Run

```bash
cd backend
uvicorn backend.main:app --reload --port 8000
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

## Endpoints

All require `Authorization: Bearer <JWT>`.

- `GET /api/{user_id}/tasks` — List tasks
- `POST /api/{user_id}/tasks` — Create (body: `{ "title": "...", "description": "..." }`)
- `GET /api/{user_id}/tasks/{id}` — Get one
- `PUT /api/{user_id}/tasks/{id}` — Update (body: `{ "title": "...", "description": "..." }`)
- `DELETE /api/{user_id}/tasks/{id}` — Delete
- `PATCH /api/{user_id}/tasks/{id}/complete` — Toggle complete
