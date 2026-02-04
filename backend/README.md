# Evolution of Todo — Backend (Phase II + III)

FastAPI + SQLModel + Neon PostgreSQL. JWT auth via Better Auth. Phase III: chat endpoint + OpenAI Agents SDK (task tools).

## Setup

```bash
cd backend
uv sync   # or: pip install -e .
```

## Environment

- `DATABASE_URL` — Neon PostgreSQL connection string (e.g. `postgresql://user:pass@host/db?sslmode=require`)
- `BETTER_AUTH_SECRET` — Same secret as frontend Better Auth (JWT signing)
- `OPENAI_API_KEY` — Required for Phase III chat (OpenAI Agents SDK)

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

### Phase III — Chat

- `POST /api/{user_id}/chat` — Send message, get AI response (body: `{ "message": "...", "conversation_id": null | number }`). Returns `{ conversation_id, response, tool_calls }`. Requires `OPENAI_API_KEY`.
