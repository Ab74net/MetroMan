# Washington DC Metro 3D Map

Part 1 scaffolds the monorepo, backend runtime, PostGIS schema, Prisma contract, shared types, and mock seed data for a production-grade DC Metro 3D map. Frontend visualization, backend routes, and WebSocket streaming are intentionally deferred to later parts.

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop with Compose support

## Project Layout

- `frontend/` - Next.js 14 App Router scaffold with strict TypeScript
- `backend/` - Express, Prisma, strict TypeScript, migration, and seed scripts
- `shared/` - domain types and typed WebSocket event contracts

## Local Setup

1. Install workspace dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment files:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   ```

   On Windows PowerShell:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.local.example frontend/.env.local
   ```

3. Start PostgreSQL with PostGIS and Redis:

   ```bash
   docker compose up -d
   ```

## Database Migration And Seed

Apply the SQL migration through Prisma:

```bash
npm run db:migrate
```

Seed the mock WMATA network:

```bash
npm run db:seed
```

Reset the database back to the migration baseline when needed:

```bash
npm run db:reset
```

## Backend Dev Server

Start the backend scaffold in watch mode:

```bash
npm run dev:backend
```

The backend listens on `http://localhost:3001` by default.

## WMATA Live Feed Setup

TODO: Put the real `WMATA_API_KEY`, `WMATA_GTFS_RT_URL`, and `WMATA_ALERTS_URL` values in `backend/.env` before wiring live polling in later parts.

## OpenTripPlanner Setup

TODO: Add the OpenTripPlanner container, graph build steps, and feed configuration in a later project phase.
