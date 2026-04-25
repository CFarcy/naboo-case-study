# Naboo Case Study

A full-stack case-study application with a NestJS/GraphQL/Mongoose backend and a Next.js frontend.

## Stack

- **Backend:** NestJS, GraphQL (Apollo Server), Mongoose, MongoDB, JWT cookie auth
- **Frontend:** Next.js 13 (pages router), Mantine UI, Apollo Client, Vitest

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/) (for local MongoDB)

## Fresh-clone setup

1. Install dependencies:

   ```bash
   make install
   ```

2. Create the backend environment file:

   ```bash
   make setup
   ```

   This copies `back-end/.env.dist` to `back-end/.env`. Update the values in `back-end/.env` before starting the backend.

3. Suggested local defaults for `back-end/.env`:

   ```env
   MONGO_URI=mongodb://localhost:27017/naboo
   JWT_SECRET=dev-secret
   JWT_EXPIRATION_TIME=3600
   FRONTEND_DOMAIN=localhost
   FRONTEND_URL=http://localhost:3001
   PORT=3000
   ```

4. Start the local MongoDB container:

   ```bash
   make db-up
   ```

## Startup order

Start services in this order:

1. Database: `make db-up`
2. Backend: `make backend-dev`
3. Frontend: `make frontend-dev`

The frontend depends on the backend for GraphQL and REST requests, so the backend must be running first.

## Local ports and endpoints

| Service | Port | Notes |
|---------|------|-------|
| Backend | 3000 | GraphQL at `/graphql`, REST at `/api` |
| Frontend | 3001 | Next.js dev server |
| MongoDB | 27017 | Exposed on `127.0.0.1:27017` via Docker |

## Seeded credentials

The backend seeds two demo accounts on every bootstrap. If the users already exist, the seed is skipped.

| Email | Password | Role |
|-------|----------|------|
| `user1@test.fr` | `user1` | user |
| `admin@test.fr` | `admin` | admin |

**Note:** Starting the backend is not a zero-side-effect action. It will create seed data if absent.

## GraphQL codegen

If the backend schema changes, regenerate frontend types from the committed schema file:

```bash
# In front-end/
npm run generate-types
```

This copies `../back-end/schema.gql` to `src/graphql/schema.gql` and runs codegen against the local file. A running backend is only required if `back-end/schema.gql` itself is stale.

## Frontend environment variables

The frontend reads these optional environment variables at build time:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
```

If unset, the frontend falls back to the above localhost defaults.

## Common commands

All commands can be run from the repo root via `make`, or inside the package directories with `npm run`.

### Root Make targets

| Target | What it does |
|--------|--------------|
| `make install` | Installs dependencies in both `back-end/` and `front-end/` |
| `make setup` | Creates `back-end/.env` from `.env.dist` if it does not exist |
| `make db-up` | Starts the local MongoDB container |
| `make db-down` | Stops the local MongoDB container |
| `make db-reset` | Stops MongoDB and removes its persistent volume |
| `make backend-dev` | Starts the backend dev server (`nest start --watch`) |
| `make frontend-dev` | Starts the frontend dev server (`next dev -p 3001`) |
| `make start-dev` | Starts MongoDB, then runs backend and frontend together |
| `make check` | Runs TypeScript type checks in both packages |
| `make lint` | Runs lint in both packages |
| `make test` | Runs tests in both packages |
| `make build` | Runs production builds in both packages |

### Package scripts

**Backend (`back-end/`):**

| Script | Command |
|--------|---------|
| `npm run start:dev` | Dev server with watch |
| `npm run check` | TypeScript type check (`tsc --noEmit`) |
| `npm run lint` | ESLint with `--fix` |
| `npm run test` | Jest unit tests |
| `npm run test:e2e` | Jest e2e tests |
| `npm run build` | Production build |
| `npm run start:db` | Start MongoDB container |
| `npm run stop:db` | Stop MongoDB container |
| `npm run stop:db:rm` | Stop MongoDB and remove volume |

**Frontend (`front-end/`):**

| Script | Command |
|--------|---------|
| `npm run dev` | Dev server on port 3001 |
| `npm run check` | TypeScript type check (`tsc --noEmit`) |
| `npm run lint` | Next.js ESLint |
| `npm run test` | Vitest |
| `npm run build` | Production build |
| `npm run generate-types` | Copy schema and run GraphQL codegen |

## Project structure

```
.
├── back-end/          # NestJS backend
├── front-end/         # Next.js frontend
├── compose.yaml       # Docker Compose: local MongoDB
├── Makefile           # Root command surface
└── README.md          # This file
```

See `AGENTS.md` for additional contributor context and conventions.
