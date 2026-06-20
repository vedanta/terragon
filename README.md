<p align="center">
  <img src="public/terragon.png" alt="Terragon" width="128" height="128" />
</p>

<h1 align="center">Terragon</h1>

A lightweight, **GitHub-native** project-management app for small teams. Terragon turns GitHub Issues into a clean **Kanban + grooming** workspace without replacing GitHub as the source of truth.

> GitHub Issues are the task system. Terragon is the execution surface.

## Status

**MVP complete** — built in public across groups G1–G9 (each a human-reviewed PR). GitHub login, the live Kanban board, drag-to-change-status, inline issue editing, and batch grooming all work against real GitHub Issues. Set `USE_FIXTURES=false` (with a selected repository) to run against your own repo; the default shows seeded demo data.

## Run

```bash
npm install
npm run dev   # http://localhost:3000
```

Configure auth/DB via `.env` (see `.env.example`): GitHub OAuth App, a Neon Postgres `DATABASE_URL`, `AUTH_SECRET`, and `TERRAGON_ENCRYPTION_KEY`. Run `npm run db:migrate` to apply the schema.

## Docs

| Doc                                                          | What it covers                                                                     |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| [`docs/concept-validation.md`](docs/concept-validation.md)   | Critical review of the concept; risks, gaps, and the locked decisions              |
| [`docs/architecture.md`](docs/architecture.md)               | System architecture, GitHub API strategy, data model, status model (with diagrams) |
| [`docs/design.md`](docs/design.md)                           | UX / interface design                                                              |
| [`docs/ui-spec.md`](docs/ui-spec.md)                         | Concrete design tokens, typography, interaction constants                          |
| [`docs/prototype-review.md`](docs/prototype-review.md)       | Review of the original interactive prototype                                       |
| [`docs/implementation-plan.md`](docs/implementation-plan.md) | Phased build plan (0–6)                                                            |
| [`docs/delivery-plan.md`](docs/delivery-plan.md)             | Execution process: task groups + PR workflow                                       |

## Stack (planned)

Next.js (App Router) · TypeScript · Tailwind + shadcn/ui · Auth.js (GitHub OAuth) · Neon Postgres + Drizzle · Octokit (GraphQL reads / REST writes) · Vercel.

## License

To be decided.
