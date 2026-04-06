# LMS API (FastAPI)

Production-oriented async API for courses, lessons, tasks, tickets, bookings, and jobs. Uses **PostgreSQL** (e.g. Supabase), **SQLAlchemy 2 async**, **Pydantic v2**, and **JWT** (Bearer) auth with **student** / **admin** roles.

## Setup

1. Create a virtual environment and install dependencies:

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and set database credentials using **either**:

   - **`DATABASE_URL`** — Supabase Dashboard → **Project Settings → Database → Connection string → URI**. You can paste `postgresql://...` as-is; the app rewrites it to `postgresql+asyncpg://`. Prefer the **transaction pooler** (port `6543`) for many short connections, or **direct** (port `5432`) for long sessions; **or**
   - **`SUPABASE_DB_HOST` + `SUPABASE_DB_PASSWORD`** — use Cursor’s **Supabase MCP** (`list_projects` / `get_project`) to copy **`database.host`**. The **database password is not exposed via MCP**; set it from **Dashboard → Database** (reset if needed). Omit `DATABASE_URL` when using this option.

   Also set **`DATABASE_SSL=true`** for Supabase (default), **`JWT_SECRET_KEY`**, and **`CORS_ORIGINS`**. Optional: **`DB_POOL_*`** (see `.env.example`).

3. Create tables (development only; use **Alembic** migrations for production):

```bash
python scripts/init_db.py
```

4. Run the server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- OpenAPI docs: `http://localhost:8000/docs`
- Health: `GET /health`

## Authentication

Send `Authorization: Bearer <access_token>` on protected routes. Obtain a token with `POST /api/v1/auth/login` (JSON body: `email`, `password`).

Register with `POST /api/v1/auth/register`. The first admin user is typically promoted via database or `PATCH /api/v1/users/{user_id}/role` from an existing admin.

## Main endpoints (prefix `/api/v1`)

| Area | Routes |
|------|--------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Users | `PATCH /users/me`, `PATCH /users/{id}/role` (admin) |
| Courses | `POST /courses`, `GET /courses`, `GET /courses/{id}`, `POST /courses/{id}/enroll`, `POST /courses/{id}/modules`, `POST /modules/{id}/lessons` |
| Lessons | `POST /lessons/{id}/progress` |
| Tasks | `POST /tasks`, `GET /tasks`, `POST /tasks/{id}/submit`, `PATCH /tasks/submissions/{id}/review` |
| Tickets | `POST /tickets`, `GET /tickets`, `GET /tickets/{id}`, `POST /tickets/{id}/messages`, `POST /tickets/{id}/close` |
| Bookings | `POST /time-slots`, `GET /time-slots`, `POST /bookings`, `GET /bookings` |
| Jobs | `POST /jobs`, `GET /jobs`, `POST /jobs/{id}/apply` |

## Database layout

Tables: `users`, `courses`, `modules`, `lessons`, `enrollments`, `progress`, `tasks`, `submissions`, `tickets`, `messages`, `time_slots`, `bookings`, `jobs`, `applications`.

The async engine (`sqlalchemy.ext.asyncio` + **asyncpg**) reads `DATABASE_URL` and optional SSL/pool settings from the environment (see `app/core/config.py` and `app/db/session.py`).

## Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the **URI** from **Database → Connection string** (use the password you set when creating the project).
3. Put it in `.env` as `DATABASE_URL`. The backend accepts `postgresql://` or `postgresql+asyncpg://` and enables TLS by default for remote hosts.
4. Run `python scripts/init_db.py` once (or use Alembic) to create tables in the `postgres` database.

## Production notes

- Run behind HTTPS; tune CORS to real origins.
- Use Alembic for schema changes; avoid `init_db` in production.
- Rotate `JWT_SECRET_KEY` with a migration plan for issued tokens.
