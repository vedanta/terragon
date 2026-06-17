# Terragon — Concept Validation

A critical review of `concept/concept.md` before implementation. Verdict, strengths, risks, and the decisions that must be resolved early.

## Verdict

**The concept is sound and worth building.** The core thesis — *GitHub Issues are the task system; Terragon is the execution surface* — is a real, underserved niche between "raw GitHub Issues" and "Jira/Linear." Scope discipline is excellent: the V1 non-goals list (§4) is the strongest part of the spec.

The risks are almost entirely in **one place: the status model.** Terragon encodes board status as GitHub labels while GitHub also has its own native open/closed state. Reconciling those two sources of truth is the hard problem the spec under-specifies. Everything below orbits that.

## Strengths

- **GitHub-as-source-of-truth** is the right call. It removes the hardest part of a PM tool (being a reliable datastore) and makes Terragon additive rather than a migration.
- **Tight, opinionated scope.** Four columns, one signature feature (Grooming), explicit non-goals. This is buildable by a small team.
- **Grooming Mode is the actual differentiator** — Gmail-style bulk editing of issues is genuinely missing from GitHub's UI.
- **Sensible tech stack** for the domain (Next.js + server-side GitHub access + small Postgres for metadata only).

## Risks & Gaps (ranked)

| # | Issue | Severity | Resolution |
|---|-------|----------|------------|
| 1 | **Native issue state vs. `terragon/*` label.** A `terragon/done` issue stays *open* in GitHub by default (§12), so "done" work clutters GitHub's issue list; meanwhile teams that close issues to mark done get no `terragon/*` label. The board has two competing truths. | High | Treat **closed → Done** as authoritative regardless of label, and resolve status on read (see Architecture §"Status Resolution"). Make `auto_close_done` the recommended-on default, not off. |
| 2 | **Label transition is not atomic.** "Remove old label, add new label" (§27) is ≥2 API calls. A partial failure leaves an issue with zero or two `terragon/*` labels, violating the one-label invariant. | High | **Add-then-remove** ordering (never lose a status), plus a read-time resolver that picks a winner by precedence when multiple labels exist. Self-heals on next sync. |
| 3 | **Secondary rate limits on batch updates.** Each batch issue = multiple mutations (label add/remove + assignee + milestone). 20+ issues in rapid succession can trip GitHub's secondary/abuse limits, not just the 5000/hr primary limit. | High | Controlled concurrency (≤3–5 in flight), exponential backoff on 403/secondary-limit, and the partial-success reporting the spec already requires. |
| 4 | **Where do unlabeled issues land?** A freshly fetched open issue with no `terragon/*` label and no mapped legacy label has no column. Not specified. | Medium | Default rule: open + no status → **Planned**. Document precedence explicitly. |
| 5 | **Auth model is internally inconsistent.** §13 recommends plain OAuth for MVP, but the `accounts` schema (§17) has `refresh_token` + `token_expires_at`, which only apply to GitHub *App* user-to-server (expiring) tokens. | Medium | Pick one. Recommended: **Auth.js + GitHub OAuth App** for MVP (non-expiring tokens, simplest), migrate to GitHub App for V2 webhooks. Drop refresh columns until then. |
| 6 | **GraphQL + REST hybrid doubles the client surface.** Two auth paths, two error shapes, two pagination models — meaningful complexity for an MVP. | Medium | **Locked: hybrid.** Justified (GraphQL reads are far more rate-efficient); build **one GitHub client module** that hides both behind a single typed interface so callers never see which API is used. |
| 7 | **Optimistic drag-drop needs rollback.** §23 promises <300ms optimistic UI but §27 doesn't define failure behavior. | Medium | On mutation failure, revert the card to its prior column and surface a specific error toast. |
| 8 | **Token encryption key management** is asserted (§22) but unspecified. | Medium | Use an app-level symmetric key (e.g. `TERRAGON_ENCRYPTION_KEY`) via a managed secret; encrypt before persisting, decrypt only server-side. |
| 9 | **Multi-user concurrency** (two people grooming the same repo). | Low | Last-write-wins is acceptable for MVP per §21; revisit with webhooks in V2. |
| 10 | **Large repos** (thousands of issues) blow the 200-issue performance target. | Low | Cursor-paginated fetch + server filtering + optional `issue_cache`. Acceptable to scope MVP to active/open issues. |

## Tech Corrections

- **Vercel Postgres is deprecated** — it (and Vercel KV) are no longer offered as first-party products. The spec lists it (§14, §30). Use a **Vercel Marketplace database instead: Neon Postgres** (recommended) or Supabase. Update §14/§30 accordingly.
- **Prefer Drizzle over Prisma** for this workload (lightweight, edge/serverless-friendly, no engine binary) — either works; Drizzle suits a "metadata-only" DB and serverless functions better.
- **Edge runtime is unnecessary.** GitHub mutations + DB access are simplest on the standard Node.js serverless runtime (Fluid Compute). Don't reach for edge functions.

## Locked Decisions (2026-06-16)

These were the open questions; all are now resolved and carried into [`architecture.md`](./architecture.md).

| # | Decision | Resolution | Implication |
|---|----------|------------|-------------|
| 1 | **Auth model** | **Auth.js + GitHub OAuth App** | MVP path; non-expiring tokens. `accounts` drops `refresh_token`/`token_expires_at` until a GitHub App lands in V2. |
| 2 | **Done semantics** | **Auto-close on Done, user-overridable** | `auto_close_done` defaults **on**: moving to Done applies `terragon/done` *and* closes the issue; moving out reopens it. Setting can disable. |
| 3 | **GitHub API** | **Hybrid — GraphQL reads + REST writes** | The spec's design, built behind one client interface. Rate-efficient from day one; accept two pagination/error models. |
| 4 | **Data layer** | **Neon Postgres + Drizzle** (via Vercel Marketplace) | Serverless-native, no engine binary. Vercel Postgres is out (deprecated). |
| 5 | **Status precedence** | `in-progress > planned > backburner > done` | Applied default for issues carrying multiple `terragon/*` labels (used by the read-time resolver). |

These determine the GitHub client and the data model. Everything else in the spec proceeds as written.
