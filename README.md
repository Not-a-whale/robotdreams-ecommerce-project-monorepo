# Ecommerce Shop Monorepo

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop

## Project Structure

- `apps/backend` — NestJS API + TypeORM
- `apps/frontend` — Next.js app
- `packages/*` — shared packages

## Environment Setup

Create/update root `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=root
DB_NAME=ecommerce

JWT_SECRET=your_jwt_secret
PORT=3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
SESSION_SECRET_KEY=your_long_secret
```

Create/update frontend env at `apps/frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
SESSION_SECRET_KEY=your_long_secret
```

## Local Development (recommended first)

From repo root:

1. Install dependencies:

```bash
npm install
```

2. Start Postgres only:

```bash
docker compose up -d postgres
```

3. Start backend:

```bash
npm --prefix apps/backend run dev
```

4. Start frontend:

```bash
npm --prefix apps/frontend run dev
```

Open:

- Frontend: http://localhost:3001
- Backend: http://localhost:3000

## Database Commands

Run migrations:

```bash
npm --prefix apps/backend run migration:run
```

Seed users:

```bash
npm --prefix apps/backend run seed
```

## Docker Dev Stack

Run all services with dev override:

```bash
docker compose -f docker-compose.yml -f compose.dev.yml up --build
```

## Troubleshooting

### Frontend auth `fetch failed` / `ECONNREFUSED`

- Ensure frontend server actions use `NEXT_PUBLIC_API_URL` or `BACKEND_URL`.
- In Docker, backend should resolve as `http://api:3000`.

### Next.js endless restart on config changes

- Ensure there is no accidental `apps/frontend/next.config.js` directory.
- Recreate frontend container:

```bash
docker compose -f docker-compose.yml -f compose.dev.yml up --build --force-recreate frontend
```

### TypeORM startup issues

- If schema/migration drift appears, run migration command manually.
- Prefer consistent strategy: either migrations-first or synchronize-only.

