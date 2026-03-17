# How To Run The App

This project is a monorepo with three workspaces:

- `frontend/` - Next.js 14 app
- `backend/` - Express + Prisma + PostGIS backend
- `shared/` - shared TypeScript types

## 1. Prerequisites

Make sure these are installed first:

- Node.js 20+
- npm 10+
- Docker Desktop

## 2. Install Dependencies

From the repo root:

```powershell
npm install
```

This installs dependencies for the root workspace plus `frontend`, `backend`, and `shared`.

## 3. Create Local Env Files

Copy the example env files:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.local.example frontend/.env.local
```

Notes:

- The backend scaffold requires all env vars to exist at startup.
- For this Part 1 scaffold, the example values are enough to boot locally.
- Replace the WMATA and MapTiler placeholders later when live integrations are added.

## 4. Start PostgreSQL And Redis

From the repo root:

```powershell
docker compose up -d
```

This starts:

- PostgreSQL 15 with PostGIS
- Redis

## 5. Run Database Migration

From the repo root:

```powershell
npm run db:migrate
```

## 6. Seed The Database

From the repo root:

```powershell
npm run db:seed
```

This loads:

- all 6 WMATA rail lines
- the mock station network
- curved route segments
- mock train positions
- predictions
- alerts

## 7. Start The Backend

In one terminal:

```powershell
npm run dev:backend
```

Backend default URL:

- `http://localhost:3001`

## 8. Start The Frontend

In a second terminal:

```powershell
npm run dev:frontend
```

Frontend default URL:

- `http://localhost:3000`

## 9. Stop The App

To stop the frontend/backend dev servers, use `Ctrl+C` in each terminal.

To stop Docker services:

```powershell
docker compose down
```

## Troubleshooting

### `npm install` fails

- Make sure you have internet access.
- Make sure npm is available with `npm -v`.

### Backend fails on env validation

- Confirm `backend/.env` exists.
- Confirm all keys from `backend/.env.example` are present.

### Database commands fail

- Confirm Docker Desktop is running.
- Confirm containers are up with:

```powershell
docker compose ps
```

### Frontend or backend port already in use

- Change `PORT` in `backend/.env` for the backend.
- Change the Next.js dev port with:

```powershell
npm run dev:frontend -- --port 3002
```
