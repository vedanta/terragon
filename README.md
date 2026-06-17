# Terragon

A lightweight, **GitHub-native** project-management app for small teams. Terragon turns GitHub Issues into a clean **Kanban + grooming** workspace without replacing GitHub as the source of truth.

> GitHub Issues are the task system. Terragon is the execution surface.

## Status

**Pre-implementation** — this repo currently holds the planning artifacts (specs, architecture, design, and delivery plan). The application is built in public as a sequence of grouped, human-reviewed PRs.

## Docs

| Doc | What it covers |
|-----|----------------|
| [`docs/concept-validation.md`](docs/concept-validation.md) | Critical review of the concept; risks, gaps, and the locked decisions |
| [`docs/architecture.md`](docs/architecture.md) | System architecture, GitHub API strategy, data model, status model (with diagrams) |
| [`docs/design.md`](docs/design.md) | UX / interface design |
| [`docs/ui-spec.md`](docs/ui-spec.md) | Concrete design tokens, typography, interaction constants |
| [`docs/prototype-review.md`](docs/prototype-review.md) | Review of the original interactive prototype |
| [`docs/implementation-plan.md`](docs/implementation-plan.md) | Phased build plan (0–6) |
| [`docs/delivery-plan.md`](docs/delivery-plan.md) | Execution process: task groups + PR workflow |

## Stack (planned)

Next.js (App Router) · TypeScript · Tailwind + shadcn/ui · Auth.js (GitHub OAuth) · Neon Postgres + Drizzle · Octokit (GraphQL reads / REST writes) · Vercel.

## License

To be decided.
