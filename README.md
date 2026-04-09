# WATResearch Web

The official website for WATResearch.

**Live:** [watresearch.ca](https://watresearch.ca)

## Tech Stack

- **Frontend:** React-TypeScript + TailwindCSS (Vite)
- **Backend:** FastAPI + SQLAlchemy (async)
- **Database:** Supabase (Postgres)
- **Auth:** Supabase Auth (JWT)
- **Hosting:** Vercel (frontend), Railway (backend)

## Getting Started

### Frontend

```bash
cd frontend
npm install
cp .env.example .env # set VITE_API_URL
npm run dev
```

### Backend

```bash
cd backend
uv sync
cp .env.example .env # fill in Supabase credentials + admin credentials
uv run uvicorn app.main:app --reload
```

## Database Migrations (Alembic)

Migrations are managed with Alembic. From the `backend/` directory:

```bash
# Generate a migration after changing a model
uv run alembic revision --autogenerate -m "describe your change"

# Apply migrations to the database
uv run alembic upgrade head

# Check current migration state
uv run alembic current

# Rollback one migration
uv run alembic downgrade -1
```

## Scripts

### Frontend

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

### Backend

| Command | Description |
| :--- | :--- |
| `uv run uvicorn app.main:app --reload` | Start dev server |
| `uv run alembic revision --autogenerate -m "msg"` | Generate migration |
| `uv run alembic upgrade head` | Apply migrations |

## Admin Panel

Accessible at `/admin` on the backend (e.g. `localhost:8000/admin` or `api.watresearch.ca/admin`). Used to manage blog posts. Credentials are set via `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`.

## Deployment

- **Frontend:** Vercel auto-deploys on push to `main`
- **Backend:** Railway auto-deploys on push to `main` (runs `start.sh` which applies migrations then starts uvicorn)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branching strategy, naming conventions, and contribution guidelines.
