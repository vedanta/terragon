# Terragon — UI Reference

The design tokens, typography, presets, interaction constants, and microcopy that define Terragon's look and feel. Pairs with [`design.md`](./design.md) (UX intent).

## Typography

- **Inter** (loaded via `next/font/google`), system-sans fallback.
- Card title 13.5px (13px in compact density); compact metadata; no oversized dashboard type.

## Design tokens (light / dark)

CSS custom properties defined in `app/globals.css` (`:root` and `[data-theme="dark"]`) and exposed to Tailwind via `@theme`.

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

Label colors come from each GitHub label; assignee avatar colors are derived deterministically from the login.

## Presets (workspace settings)

Stored per repository in `workspace_settings`:

- **accent** — swatches `#5b5bd6` (indigo, default) · `#1f8a5b` (green) · `#d97757` (terracotta) · `#111111` (near-black).
- **defaultTheme** — `light` (default) | `dark`.
- **compactCards** — `false` (default) | `true`.

## Card density

| | Default | Compact |
|---|---------|---------|
| padding | `11px 12px` | `8px 10px` |
| title size | `13.5px` | `13px` |

Board cards show `#number`, title, assignee avatar, labels, milestone — **no description** on the board.

## Interaction constants

- **Drag & drop** (native HTML5): dragged card opacity `0.4`; columns raise their border to `--border-strong` while a drag is active; dropping a card moves it to that column (optimistic, with rollback on failure).
- **Toasts**: single slot, auto-dismiss after **2000ms** (timer resets on a new toast). Examples: `#142 moved to In Progress` · `Updated 6 issues · synced to GitHub`.
- **Command palette** (`cmdk`): `⌘K` / `Ctrl+K` toggles; autofocus. Empty query → actions + first **6** issues; with a query → fuzzy match on title + number. `↑/↓` move, `Enter` runs, `Esc` closes. Actions: Go to Board · Go to Grooming · Toggle theme · Create issue.
- **Keyboard**: `N` (new), `G then B/G/M` (Board/Grooming/Milestones), `/` (focus search), `Esc` (close palette, else drawer). Shortcuts ignore typing in inputs.
- **Drawer**: right-side panel (not modal); scrim `--overlay`; `Esc` closes. Edits round-trip to GitHub.
- **Grooming bulk**: requires at least one staged change (else a "Pick a change first" toast); applies to the selected rows and reports per-issue **partial success**.

## Microcopy

- Board subtitle → `<owner>/<repo> · execution surface`; Grooming → `Backlog refinement · select rows to bulk edit`.
- Empty title fallback → `Untitled issue`.
- Batch result → `N of M updated · #X failed: <reason>`.

## View-model shaping

The UI renders a single flat presentation shape (`BoardIssue`) produced server-side from either fixtures or live GitHub data, so components stay presentational and the data layer stays testable. See `lib/view/board-issue.ts`.
