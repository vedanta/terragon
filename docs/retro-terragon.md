# Terragon — Retrospective

Retro on the delivered MVP **and** the `ao-*` skill pipeline that built it. Evidence from git, GitHub PRs/CI/issues, and the plans. Run via `/ao-run-step-1-retro`.

## Verdict

**The MVP shipped, in scope, in 3 days, with zero broken merges to `main`.** The pipeline (concept → validated design → plan → grouped HITL PRs) drove the whole thing, and the required-CI gate plus human review caught every regression before it landed. The two real process failures were the agent's, and both are now fixed in the skills.

## Metrics

| | |
|---|---|
| Merged PRs | **10** (G1–G9 + the logo) |
| Commits on `main` | 54 |
| Calendar | **3 days** (Jun 18 → 20): 4 PRs · 3 · 3 |
| Milestones | 9 / 9 complete (all 5/5) |
| Issues | 48 created · 47 closed · 1 backlog (#39) at finish |
| Tests | **5 → 49**, grown with the features |
| CI on `main` | **10 / 10 green** |
| CI failures, all-time | **2 — both on `feat/g3-auth-data`, both pre-merge** |

The gate held: nothing broken ever reached `main`.

## What worked — keep doing

- **HITL PR + required CI per group.** Caught real bugs *before* merge: the `trustHost` route-protection failure (only reproduced on a non-Vercel `next start` — E2E caught it) and the `"use server"`-must-be-`async` build error (typecheck passed; Turbopack failed).
- **Spines before write-paths.** G4 (GitHub client + status resolver/transition, fully unit-tested) was built before any writes, so G6/G7/G8 just composed tested logic. The §6 resolver is the self-healing net for the non-atomic label problem.
- **Fixtures-by-default.** CI and preview stayed green with no secrets; live data sat behind `USE_FIXTURES=false`.
- **Evidence over memory.** Verifying external claims caught the **deprecated Vercel Postgres** and the **`jdx/mise` name collision** before either cost anything — drove the rename to Terragon and the Neon/Drizzle choice.
- **Just-in-time issues + one branch per group** kept the board honest and the history clean.

## What didn't — honest

- **Agent process slip #1:** deleted the G8 branch *before verifying the merge* → auto-closed PR #51 (recovered fully, nothing lost). → **Fixed:** `ao-build-step-1-execute-group` now requires verifying `MERGED` before any branch delete.
- **Agent process slip #2:** printed the Neon DB password to chat (a quoted value defeated a naive masking regex). → **Fixed:** `ao-plan-step-3-bootstrap-repo` now forbids printing secret values; mask by key name only. Rotation tracked in #60.
- **Coverage gap CI structurally can't close:** the `user.email NOT NULL` bug (GitHub private emails return no email) was caught only by the **operator's live OAuth test** — automation can't perform the real consent flow. Not a failure; a reminder that HITL covers what CI can't.
- **Three distinct gates, all required:** typecheck ≠ build ≠ runtime — a bug slipped each into the next (email→runtime, async→build, trustHost→e2e).

## Operator's lived experience

- **Cadence felt right** — the group-of-5 → one HITL PR grain matched how the operator wanted to review and merge.
- **Biggest friction was T0 (secrets/services)** — OAuth apps, Neon, Vercel env, and the callback-URL dance. → **Fixed forward:** `ao-plan-step-2-design-to-plan` now tells the planner to de-risk T0 up front (flag the one-callback-per-OAuth-App rule → plan dev+prod apps from the start; pre-generate secrets; automate env via CLI).

## Loop-closing actions

| Action | Status |
|--------|--------|
| Build skill: verify `MERGED` before branch delete | ✅ applied |
| Bootstrap skill: never print secret values | ✅ applied |
| Plan skill: de-risk T0 (OAuth callbacks, pre-gen secrets, automate env) | ✅ applied |
| Build skill: hand off to `/ao-run-step-1-retro` after the last group | ✅ applied |
| Rotate exposed Neon password | 📋 #60 |
| Post-MVP backlog (create-issue, palette deep-link, public-demo mode, dnd-kit, ensure-once) | 📋 #59, #39 |

## Bottom line

The `ao-*` pipeline did what it set out to: take a folder of concept files to a shipped, authenticated, live-against-GitHub MVP — same loop, nine times, each ending in a reviewed PR. It got measurably better *during* the run (the two agent slips became permanent skill guardrails), which is the point of having a retro phase at all.
