# Changelog

All notable changes to Terragon are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## [0.1.0] — 2026-06-20

First MVP. A GitHub-native Kanban + grooming workspace, built across nine
reviewed groups (G1–G9).

### Added

- **Foundation & design system** — Next.js 16 (App Router), TypeScript, Tailwind v4, the design tokens, app shell, tooling + CI. (G1)
- **Static UI** — board, issue drawer, grooming table, ⌘K command palette, and loading/empty/error states. (G2)
- **Auth & data** — GitHub OAuth (Auth.js), Neon Postgres + Drizzle, GitHub access tokens encrypted at rest, route protection, and the repository picker. (G3)
- **Technical spines** — the GitHub client (GraphQL reads / REST writes, rate-limit backoff) and the status model (label↔status resolver + transition planner). (G4)
- **Live board** — real GitHub issues resolved into columns, refresh, pagination. (G5)
- **Status writes & drag/drop** — drag a card to change status (label writes + close/reopen), optimistic with rollback; workspace label settings. (G6)
- **Issue drawer editing** — edit title, body, assignee, labels, milestone, and status inline. (G7)
- **Grooming & batch** — multi-select, staged change-sets, batch apply with controlled concurrency and partial-success reporting; audit log. (G8)
- **Polish & launch** — state coverage, full keyboard map, Prep Station / Milestones / My Work views, responsive layout, and observability via logs. (G9)

[0.1.0]: https://github.com/vedanta/terragon/releases/tag/v0.1.0
