# Evolution of Todo — Frontend (Phase II)

Next.js 16+ (App Router) + Better Auth (signup/signin, JWT) + task UI.

## Setup

```bash
cd frontend
npm install
```

## Environment

Create `.env.local`:

- `BETTER_AUTH_SECRET` — Same secret as backend (JWT). Must match backend `BETTER_AUTH_SECRET`.
- `NEXT_PUBLIC_API_URL` — Backend API URL (default: `http://localhost:8000`).
- `BETTER_AUTH_DATABASE_URL` — (Optional) Better Auth DB. Default: SQLite `file:./auth.db`.

## Run

```bash
cd frontend
npm run dev
```

App: http://localhost:3000

## Pages

- `/` — Redirects to `/dashboard` if signed in, else `/login`.
- `/login` — Sign in (email/password).
- `/signup` — Create account.
- `/dashboard` — Task list; add, edit, delete, mark complete. Requires sign-in.

All API calls to the backend include `Authorization: Bearer <JWT>`.
