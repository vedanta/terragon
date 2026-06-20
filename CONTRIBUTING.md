# Contributing to Terragon

Thanks for your interest in Terragon. This document covers how to set up the project and the workflow contributions follow.

> **License note:** Terragon is licensed under the **Business Source License 1.1** (see [`LICENSE`](LICENSE)). By contributing, you agree that your contributions are licensed under the same terms. The source is available and you may self-host for non-production and permitted production use, but offering a competing hosted service is reserved to the Licensor until the Change Date.

## Prerequisites

- Node.js 22+
- A GitHub OAuth App (for auth) and a Postgres database URL (e.g. Neon)

## Setup

```bash
git clone https://github.com/vedanta/terragon.git
cd terragon
npm install
cp .env.example .env     # fill in the values (see README → Configuration)
npm run db:migrate
npm run dev              # http://localhost:3000
```

The app defaults to seeded fixtures (`USE_FIXTURES=true`), so you can develop without GitHub credentials. Set `USE_FIXTURES=false` to work against a real repository.

## Workflow

Terragon is built in small, reviewed increments:

1. Branch off the latest `main` (`feat/...`, `fix/...`, or `docs/...`).
2. Make focused changes; keep the scope of a PR tight.
3. Run the full local gate before pushing:
   ```bash
   npm run format && npm run lint && npm run typecheck && npm run test && npm run build
   ```
4. Open a pull request against `main`. CI (lint · typecheck · test · build · e2e) must pass, and `main` requires review before merge.
5. PRs are **squash-merged**; reference issues with `Closes #NN`.

## Quality bars

- TypeScript clean (`npm run typecheck`) and lint clean (`npm run lint`).
- Add/extend tests for logic changes (Vitest) — especially anything touching the status model, GitHub client, or grooming service.
- Keep secrets out of the repo; never commit `.env`.
- Match the existing code style (Prettier enforces formatting).

## Project layout

- `app/` — Next.js App Router (route groups: `(marketing)`, `(auth)`, `(app)`)
- `components/` — UI
- `lib/` — domain logic (GitHub client, status model, board/grooming services)
- `db/` — Drizzle schema + migrations
- `docs/` — architecture, design, plans, and the build retro

See [`docs/architecture.md`](docs/architecture.md) for the system model.
