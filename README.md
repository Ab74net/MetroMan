# Washington DC Metro 3D Map (Part 1)

## Prerequisites
- Node.js 20+ (LTS)
- npm (bundled with Node) for installing per-package dependencies
- Docker & Docker Compose for the Postgres/PostGIS and Redis stack

## Getting Started
1. Start the infrastructure stack:
   ```bash
   docker compose up -d
   ```
2. Install dependencies for each workspace:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ../shared && npm install
   ```
3. Run database migrations and seed the mock data:
   ```bash
   cd backend
   npm run prisma:generate
   npm run db:migrate
   npm run db:seed
   ```
   Use `npm run db:reset` if you need to rebuild the schema and seed from scratch.

## Backend Development
- Use `npm run dev` from `/backend` to launch the scaffolded TypeScript service; the current entrypoint simply validates the parsed config and logs readiness.

## WMATA Live Feed Setup
TODO: Add the real `WMATA_API_KEY`, `WMATA_GTFS_RT_URL`, and `WMATA_ALERTS_URL` into `backend/.env` or your secrets store before hitting the live feeds.

## OpenTripPlanner Setup
TODO: Document the OpenTripPlanner build, graph generation, and runtime configuration when the routing integration is ready.
