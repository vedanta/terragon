# Terragon — UI Spec (extracted from the prototype)

Concrete, buildable UI detail pulled **verbatim** from `concept/Mise.html` so Phase 0 reproduces it without re-reading the bundle. Pairs with [`design.md`](./design.md) (intent) and [`prototype-review.md`](./prototype-review.md) (what's real vs decorative). For data shapes see [`/fixtures/seed.ts`](../fixtures/seed.ts).

## Typography

- **Inter** (the prototype bundles Inter woff2). Load via `next/font/google` Inter; system-sans fallback.
- Card title 13.5px (13px when `compactCards`); metadata compact; no oversized dashboard type.

## Design tokens (light / dark)

CSS custom properties, exactly as in the prototype. Port into the Tailwind theme + `globals.css` (`:root` and `[data-theme="dark"]`).

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--bg` | `#ffffff` | `#0a0a0b` | app background |
| `--bg-subtle` | `#fbfbfa` | `#0d0d0e` | subtle surface |
| `--col` | `#f5f5f4` | `#141416` | board column background |
| `--card` | `#ffffff` | `#1a1a1c` | cards, drawer, panels |
| `--border` | `#ececec` | `#222226` | default borders |
| `--border-strong` | `#e0e0e0` | `#2e2e33` | emphasized borders, drop targets |
| `--hover` | `#f4f4f5` | `#1c1c1f` | hover/selected rows |
| `--text` | `#18181b` | `#ededed` | primary text |
| `--text-2` | `#71717a` | `#9d9da6` | secondary text |
| `--text-3` | `#65656c` | `#a1a1aa` | tertiary / muted |
| `--accent` | `#5b5bd6` | `#7c7cf0` | accent fills |
| `--accent-text` | `#5b5bd6` | `#aaaaf7` | accent-colored text |
| `--accent-soft` | `#5b5bd614` | `#7c7cf01f` | accent tint (selected bg) |
| `--green` | `#16a34a` | `#3fb950` | Done |
| `--overlay` | `rgba(24,24,27,.28)` | `rgba(0,0,0,.55)` | drawer/palette scrim |
| `--shadow` | `0 1px 2px rgba(0,0,0,.04),0 1px 3px rgba(0,0,0,.05)` | `0 1px 2px rgba(0,0,0,.4)` | cards |
| `--shadow-lg` | `0 16px 48px rgba(0,0,0,.14),0 4px 12px rgba(0,0,0,.06)` | `0 20px 56px rgba(0,0,0,.6),0 4px 14px rgba(0,0,0,.5)` | palette/drawer |

### Status dot colors

`planned → var(--text-3)` · `in-progress → var(--accent)` · `done → var(--green)` · `backburner → #9ca3af`.

Label and person colors are data, in [`/fixtures/seed.ts`](../fixtures/seed.ts) (`LABELS`, `PEOPLE`).

## Configurable presets → settings

The prototype exposes three knobs via props. These should become **workspace/user settings** (extend `workspace_settings` or a user-prefs table — a data-model note for the implementation plan):

- **accent** — swatches `#5b5bd6` (indigo, default) · `#1f8a5b` (green) · `#d97757` (terracotta) · `#111111` (near-black). Applied by setting `--accent` on the root.
- **defaultTheme** — `light` (default) | `dark`.
- **compactCards** — `false` (default) | `true`.

## Card density

| | Default | `compactCards` |
|---|---------|----------------|
| padding | `11px 12px` | `8px 10px` |
| title size | `13.5px` | `13px` |

Board cards show: `#number`, title, assignee avatar, labels, milestone — **no description** on the board.

## Interaction constants & behaviors

**Drag & drop** (native HTML5): dragged card opacity `0.4`; on drag start set `dragging` id + `dataTransfer.effectAllowed = "move"`; columns raise border to `--border-strong` while a drag is active; `onDragOver` preventDefault; drop moves the card. (In production the drop fires the label transition + optimistic rollback — architecture §7 — not the prototype's bare `status` set.)

**Toasts**: single slot, auto-dismiss after **2000ms** (reset timer on new toast). Strings: `#142 moved to In Progress` · `Updated 6 issues · synced to GitHub` · `Moved 3 to Backburner · synced` · `Pick a change first` (bulk with no change selected) · `Repository switcher`.

**Command palette** (`cmdk`): toggle on `⌘K` / `Ctrl+K`; autofocus input (~10ms delay). Empty query → actions + first **6** issues; with query → fuzzy match on title + number, capped at **9** results. `↑/↓` move (clamped), `Enter` runs, `Esc` closes. Actions: Create new issue · Go to Board · Go to Grooming · Toggle theme.

**Escape priority**: if palette open → close palette; else if drawer open → close drawer.

**Drawer**: right-side panel (not modal); scrim `--overlay`; inline edits applied immediately to local state (production: round-trip to GitHub). `Esc` closes.

**Create issue**: number = `max(existing) + 1`; defaults `status: planned`, current user as assignee, no milestone, no labels, `updated: "just now"`; prepend to list; open its drawer; switch to Board.

**Grooming bulk**: `applyBulk` requires at least one of status/assignee chosen (else `Pick a change first`); applies to selected rows, stamps `updated: "just now"`, clears selection. Production adds labels/milestone/close and **partial-success** reporting (the prototype always succeeds — prototype-review §gaps).

## Microcopy

- View subtitles: Board → `acme/platform · execution surface`; Grooming → `Backlog refinement · select rows to bulk edit`.
- Empty title fallback → `Untitled issue`.
- GitHub issue URL pattern → `https://github.com/{owner}/{repo}/issues/{number}`.
- Comment author in prototype is hardcoded (`Maya Chen`); production uses the authenticated user.

## View-model shaping (pattern to keep)

The prototype computes a flat view-model (`renderVals`) that separates state from presentation: columns carry `{ label, dot, count, issues[], drag handlers }`; the selected issue carries every edit handler; grooming rows carry checkbox styling + toggles. Mirror this shape when passing props from Server Components / actions to the UI — it keeps components dumb and the data layer testable.

## Prototype gaps to fix (do NOT copy)

From [`prototype-review.md`](./prototype-review.md): dead nav items (Prep Station / Milestones / My Work / Settings), no auth/repo/GitHub, `moveTo` sets a bare `status` (no label model), bulk limited to status+assignee+backburner, no partial-success, no empty/loading/error states, only `⌘K`/`Esc` bound (add `N`, `G then B/G/M`, `/`).
