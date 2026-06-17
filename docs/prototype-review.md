# Terragon — Prototype Review

Review of `concept/Mise.html`, the interactive prototype. See also [`concept-validation.md`](./concept-validation.md), [`architecture.md`](./architecture.md), [`design.md`](./design.md).

## What it is

A **self-contained, single-file interactive React prototype** (~289 KB). A "dc-runtime" loader unpacks base64 + gzipped assets (one ~54 KB runtime + 11 Inter `woff2` fonts) into blob URLs at load, then renders a `<x-dc>` HTML template with `{{ }}` mustache bindings driven by a `Component extends DCLogic` view-model class (~360 lines of JSX).

- Runs offline from `file://` — **no build step, no network, no GitHub.**
- All data is an **in-memory seed**: 16 issues, 5 people, 7 labels, 4 statuses, 5 milestones, with comments + activity (extracted to [`/fixtures/seed.ts`](../fixtures/seed.ts)).
- Three configurable props: **accent** color (4 swatches), **defaultTheme** (light/dark), **compactCards** (bool).

This is a **UX specification, not production code.** The `DCLogic` view-model pattern is prototype-only — rebuild on the Next.js/React architecture in [`architecture.md`](./architecture.md); don't port it.

## Implemented (and good)

| Area | What works |
|------|-----------|
| **Board** | 4 columns (Planned · In Progress · Done · Backburner), native HTML5 drag-and-drop between columns, drag opacity, "moved to …" toast |
| **Cards** | number, title, assignee avatar, labels, milestone — matches spec card layout |
| **Drawer** | opens on click; inline-edit title/status/assignee/milestone/description; add/remove labels; post comments; activity feed; GitHub link |
| **Grooming** | checkbox multi-select + select-all; bulk status & assignee; Apply changes; bulk Backburner; clear; "Updated N · synced to GitHub" toast |
| **Command palette** | ⌘K; fuzzy search over issues + actions (create / navigate / toggle theme); arrow/enter/escape nav |
| **Polish** | light/dark theme, toasts, hover states, create-issue, restrained Linear/Vercel aesthetic with Inter |

## Gaps vs. spec

- **Dead sidebar items** — Prep Station, Milestones, My Work, Settings have no handlers. Only Board and Grooming are real views.
- **No auth, repo picker, or GitHub** — repo switcher only toasts; "synced to GitHub" is cosmetic; data is local seed.
- **Side-steps the hard architecture.** `moveTo(status)` just sets a plain `status` field — **no `terragon/*` label model, no label add/remove, no open/closed reconciliation, no close-on-Done, no atomicity, no rate limits, no partial-success.** The prototype validates the *UX*, not the risky parts in validation §1–§3.
- **Bulk actions narrower than spec** — only status + assignee + backburner (no bulk labels / milestone / close).
- **Keyboard shortcuts partial** — ⌘K and Esc work; spec's `N`, `G then B/G/M`, `/` are unbound.
- **No empty / loading / error states** — full seed always present.
- **Comment author hardcoded** to "Maya Chen" (current-user stub).

## How to use it going forward

1. **Canonical UX reference for Phase 0** (static UI) — match its layout, interactions, and design tokens.
2. **Reuse the seed as dev/test fixtures** — extracted to [`/fixtures/seed.ts`](../fixtures/seed.ts).
3. **`moveTo` is the prototype↔production divergence point.** In the real build, status changes flow through label reconciliation (architecture §6), never a naive field set. Treat the prototype's success-always behavior as the thing the real Grooming Service must replace with partial-success handling.
