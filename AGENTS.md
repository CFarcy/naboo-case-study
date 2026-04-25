# AGENTS.md

## Scope

- This repo has no root package workspace tooling.
- The repo root does contain `Makefile` and `compose.yaml` for common local tasks. Prefer the root `make` targets for install/setup/DB lifecycle/checks when they fit the task.
- Run app-specific commands inside `front-end/` or `back-end/`.
- Ignore both package `README.md` files for setup details; they are starter boilerplate and disagree with the actual scripts/config.
- Paths below are package-relative unless a section explicitly says otherwise.

## Setup

- Install dependencies separately in `front-end/` and `back-end/` with `npm install`, or use `make install` from the repo root.
- Before starting the backend, copy `back-end/.env.dist` to `back-end/.env` and set `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRATION_TIME`, `FRONTEND_DOMAIN`, and `FRONTEND_URL`.
- `make setup` creates `back-end/.env` from `back-end/.env.dist` if it does not exist yet; it does not overwrite an existing env file.
- Start local MongoDB before the backend, either with `make db-up`, `docker compose up -d mongodb` from the repo root, or `npm run start:db` in `back-end/`.
- The committed `compose.yaml` exposes MongoDB on `127.0.0.1:27017` and persists data in the named Docker volume `mongodb-data`.
- For full-stack local work, you can use `make start-dev` from the repo root to start MongoDB, the backend, and the frontend together. If you need separate processes, start MongoDB first, then the backend with `make backend-dev` or `npm run start:dev` in `back-end/` on port `3000`, then the frontend with `make frontend-dev` or `npm run dev` in `front-end/` on port `3001`.

## Frontend (`front-end/`)

- App: Next.js 13 pages router in `src/pages`, shared UI/state under `src/components`, `src/contexts`, `src/hocs`, and `src/hooks`.
- Dev server: `npm run dev` on port `3001`.
- Read-only checks: `npm run check`, `npm run lint`, `npm run format:check`, `npm test -- --run <path-to-test>`, `npm run build`.
- Path alias `@/*` maps to `src/*`.
- Apollo is wired in `src/graphql/apollo.ts`; the GraphQL endpoint reads from `NEXT_PUBLIC_GRAPHQL_URL` and falls back to `http://localhost:3000/graphql` with `credentials: "include"`.
- If you add authenticated SSR queries, follow `src/pages/my-activities.tsx` and `src/pages/activities/[id].tsx`: forward `req.headers.cookie` in the Apollo query context.
- `npm run generate-types` copies `../back-end/schema.gql` into `src/graphql/schema.gql` and then runs GraphQL codegen against that local schema file. A running backend is only needed if `back-end/schema.gql` itself is stale (e.g., after backend schema changes); regenerate it by starting the backend, then run `npm run generate-types`.

## Backend (`back-end/`)

- App: NestJS GraphQL + Mongoose in `src`. Real entrypoints are `src/main.ts` and `src/app.module.ts`.
- Dev server: `npm run start:dev` on port `3000`.
- Local DB helpers: `npm run start:db`, `npm run stop:db`, `npm run stop:db:rm` delegate to the root `compose.yaml` MongoDB service. Root equivalents also exist via `make db-up`, `make db-down`, and `make db-reset`.
- Read-only checks: `npm run check`, `npm run lint`, `npm test -- --runTestsByPath <path-to-spec>`, `npm run build`.
- `npm run lint:fix` runs ESLint with `--fix` and can modify files; use it as an explicit mutating cleanup command.
- Required env is documented in `.env.dist`: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRATION_TIME`, `FRONTEND_DOMAIN`, `FRONTEND_URL`.
- `src/main.ts` sets a global REST prefix of `/api`, but GraphQL requests still go to `/graphql`.
- GraphQL schema is auto-generated to `schema.gql`; playground is enabled in `src/app.module.ts`.
- Auth context accepts either a `jwt` header or the `jwt` cookie. `login` and `logout` set or clear that cookie in `src/auth/auth.resolver.ts`.
- The app seeds data on every bootstrap through `AppService.onApplicationBootstrap() -> SeedService.execute()`. The seed is idempotent for the bundled default users, but starting the backend is not a "no side effects" action.

## Verification

- Backend tests use `mongodb-memory-server` via `src/test/test.module.ts`; they do not need a local MongoDB.
- A targeted backend Jest run can pass and still hang with open handles after completion. Treat that separately from assertion failures.
- Prefer the smallest relevant checks while iterating, but before finishing run the relevant package checks for the files you changed.
- If you touch routing, build config, GraphQL wiring, or imports across package boundaries, include `npm run build` in the relevant package before finishing.
