# Changelog

All notable changes to Terragon are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## [0.2.0] — 2026-06-21

Board, search, and appearance polish.

### Added

- **Board filter bar** — filter issues by assignee, label, or milestone; filters combine and per-column counts follow the filtered view.
- **Board sort** — order issues within each column by updated (newest first), issue number, or title.
- **Board card views** — toggle between Summary and Detailed cards.
- **Loading UX** — a top progress bar during navigation, refresh, and mutations; the board streams with a status instead of freezing.
- **Theme mode** — Light / System / Dark, with System following the OS appearance live (Settings → Appearance).
- **Density** — Comfortable / Compact card spacing (Settings → Density).
- **Command palette search** — the top-bar search opens ⌘K; added a keyboard-shortcuts help overlay (`?`).
- **Searchable repository picker** with an active-repo indicator.
- **Dashboard breakdown widgets** — issues by assignee, label, and milestone.
- **Real GitHub avatars** for assignees and the signed-in user, with initials fallback.

### Changed

- **Prep Station → Dashboard**, rebuilt as a leaner overview.

[0.2.0]: https://github.com/vedanta/terragon/releases/tag/v0.2.0

## [0.1.0] — 2026-06-20

First release. A GitHub-native Kanban + grooming workspace.

### Added

- **GitHub sign-in** via OAuth (Auth.js); access tokens encrypted at rest.
- **Live Kanban board** — your repo's issues resolved into Planned · In Progress · Done · Backburner.
- **Drag to change status** — updates GitHub labels (and closes/reopens), optimistic with rollback.
- **Issue drawer** — edit title, body, assignee, labels, milestone, and status inline.
- **Grooming** — multi-select issues and apply batch changes with partial-success reporting.
- **Views** — Prep Station, Milestones, My Work, and a ⌘K command palette.
- **Settings** — per-repository status-label mapping and Done-closes-issue behavior.

[0.1.0]: https://github.com/vedanta/terragon/releases/tag/v0.1.0
