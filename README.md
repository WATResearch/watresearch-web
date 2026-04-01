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
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in your Supabase credentials
uvicorn main:app --reload
```

## Database Migrations (Alembic)

Migrations are managed with Alembic. From the `backend/` directory:

```bash
# Generate a migration after changing a model
alembic revision --autogenerate -m "describe your change"

# Apply migrations to the database
alembic upgrade head

# Check current migration state
alembic current

# Rollback one migration
alembic downgrade -1
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
| `uvicorn main:app --reload` | Start dev server |
| `alembic revision --autogenerate -m "msg"` | Generate migration |
| `alembic upgrade head` | Apply migrations |

## Deployment

- **Frontend:** Vercel auto-deploys on push to `main`
- **Backend:** Railway auto-deploys on push to `main`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branching strategy, naming conventions, and contribution guidelines.
