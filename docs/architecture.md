# Terragon — Architecture

Technical architecture for Terragon: a GitHub-native execution layer over GitHub Issues. This document supersedes the architecture portions of `concept/concept.md` (§13–§27) and folds in the decisions from [`concept-validation.md`](./concept-validation.md).

**Guiding invariant:** GitHub is the system of record. Terragon persists only its own metadata, preferences, and an optional cache. All GitHub calls are server-side; tokens never reach the client.

---

## 1. System Context

```mermaid
flowchart LR
  User([Team member]) -->|HTTPS| App[Terragon Web App<br/>Next.js App Router]
  App -->|Server Actions /<br/>Route Handlers| Server[Terragon Server Layer]
  Server -->|reads: GraphQL<br/>writes: REST| GitHub[(GitHub API)]
  Server -->|metadata only| DB[(Postgres<br/>Neon / Supabase)]
  GitHub --> Data[Issues · Labels<br/>Milestones · Assignees]

  classDef ext fill:#eee,stroke:#999;
  class GitHub,Data ext;
```

GitHub owns all issue data. The Postgres DB owns only Terragon-specific state (settings, repo mappings, encrypted tokens, sync log, optional cache).

---

## 2. Containers & Domain Services

```mermaid
flowchart TB
  subgraph Client["Browser (Client Components)"]
    UI[React + shadcn/ui]
    DnD[dnd-kit drag/drop]
    Q[TanStack Query<br/>server cache]
    Z[Zustand<br/>ephemeral UI state]
  end

  subgraph Next["Next.js Server"]
    SC[Server Components<br/>initial loads]
    SA[Server Actions<br/>mutations]
    RH[Route Handlers<br/>/api/github/* · webhooks]
  end

  subgraph Domain["Domain Services (server-only)"]
    GHC[GitHub Client<br/>auth · GraphQL · REST · pagination]
    ISVC[Issue Service<br/>label↔status · transitions]
    BSVC[Board Service<br/>group · sort · filter]
    GSVC[Grooming Service<br/>batch plans · partial results]
    SSVC[Sync Service<br/>cache · webhooks · audit]
  end

  DB[(Postgres)]
  GH[(GitHub GraphQL + REST)]

  UI --> Q --> SA
  DnD --> SA
  UI --> SC
  SC --> ISVC
  SA --> ISVC
  SA --> GSVC
  RH --> SSVC
  ISVC --> GHC
  BSVC --> ISVC
  GSVC --> GHC
  SSVC --> GHC
  GHC --> GH
  ISVC --> DB
  SSVC --> DB
```

**Service responsibilities** (single GitHub client; everything else composes it):

- **GitHub Client** — the only module that talks to GitHub. Hides GraphQL (reads) and REST (writes) behind one typed interface; owns auth headers, pagination, rate-limit handling, and backoff.
- **Issue Service** — maps a GitHub issue → a Terragon task, resolves status from labels + native state, and enforces transition rules.
- **Board Service** — groups resolved issues into the four columns, applies sort/filter and board preferences.
- **Grooming Service** — turns a multi-select + change set into a per-issue update plan, executes with controlled concurrency, returns a partial-success summary.
- **Sync Service** — on-demand refresh, V2 webhook ingestion, and the audit/sync-event log.

---

## 3. GitHub API Strategy

Hybrid by design (see validation §6 — wrapped in one client):

| Concern | API | Why |
|---------|-----|-----|
| Read issues, labels, milestones, assignees, pagination | **GraphQL** | One round-trip per page; far more rate-limit efficient than REST list+expand. |
| Update issue, add/remove labels, set assignees/milestone, close/reopen | **REST** | Simpler, well-documented mutation endpoints; easier partial-failure handling. |

- **Rate limits:** primary 5000/hr per user *and* secondary/abuse limits on bursts. Batch mutations run at concurrency ≤3–5 with exponential backoff on `403`/secondary-limit responses.
- **Pagination:** cursor-based (GraphQL `pageInfo`). MVP scopes the board to open + recently-closed issues.

---

## 4. Authentication

**MVP: Auth.js + GitHub OAuth App** (non-expiring user tokens — simplest). Migrate to a GitHub App for V2 (webhooks, fine-grained perms, expiring tokens).

```mermaid
sequenceDiagram
  participant U as User
  participant M as Terragon (Next.js)
  participant GH as GitHub OAuth

  U->>M: Click "Login with GitHub"
  M->>GH: Redirect to /authorize (read:user, repo)
  GH->>U: Consent screen
  U->>GH: Approve
  GH->>M: Redirect /callback?code=...
  M->>GH: Exchange code → access_token
  GH-->>M: access_token
  M->>M: Encrypt token, persist, create session
  M-->>U: Set HTTP-only, Secure session cookie
```

- Scopes: `read:user`, `repo` (private) or `public_repo` (public-only).
- Tokens are **encrypted at rest** (`TERRAGON_ENCRYPTION_KEY`), decrypted only inside the GitHub Client. Never serialized to the client.
- Session via HTTP-only Secure cookie; CSRF protection on mutations.

---

## 5. Data Model

Terragon-owned tables only. GitHub data is fetched live (or cached, never authoritative).

```mermaid
erDiagram
  users ||--o{ accounts : has
  users ||--o{ user_repositories : opens
  repositories ||--o{ user_repositories : linked
  repositories ||--|| workspace_settings : configured_by
  repositories ||--o{ issue_cache : caches
  repositories ||--o{ sync_events : logs
  users ||--o{ grooming_drafts : authors

  users {
    uuid id PK
    bigint github_user_id
    string github_login
    string avatar_url
  }
  accounts {
    uuid id PK
    uuid user_id FK
    string access_token_encrypted
  }
  repositories {
    uuid id PK
    bigint github_repo_id
    string full_name
    bool private
  }
  workspace_settings {
    uuid id PK
    uuid repository_id FK
    string label_planned
    string label_in_progress
    string label_done
    string label_backburner
    bool auto_close_done
  }
  issue_cache {
    uuid id PK
    uuid repository_id FK
    int issue_number
    string status
    timestamp updated_at_github
  }
  grooming_drafts {
    uuid id PK
    uuid user_id FK
    uuid repository_id FK
    json draft_payload
  }
  sync_events {
    uuid id PK
    uuid repository_id FK
    string event_type
    string status
  }
```

Notes vs. spec §17: `accounts` drops `refresh_token`/`token_expires_at` for the OAuth-App MVP (re-add with GitHub App). `issue_cache` and `grooming_drafts` are optional — build only when needed.

---

## 6. Status Model

Board status lives in the `terragon/*` label namespace, reconciled with GitHub's native open/closed state.

```
terragon/planned · terragon/in-progress · terragon/done · terragon/backburner
```

### Transitions

```mermaid
stateDiagram-v2
  [*] --> Planned: open, no status
  Planned --> InProgress
  InProgress --> Done
  InProgress --> Planned
  Done --> Planned
  Done --> InProgress
  Planned --> Backburner
  InProgress --> Backburner
  Done --> Backburner
  Backburner --> Planned
  Done --> [*]: close issue (auto_close_done, default on)
```

### Status Resolution (read time)

Because labels and native state can disagree (validation §1, §2, §4), status is **resolved on every read** — this also self-heals partial-failure label states:

```mermaid
flowchart TD
  I[Issue from GitHub] --> Closed{state == closed?}
  Closed -->|yes| Done[Done]
  Closed -->|no| Count{how many terragon/* labels?}
  Count -->|exactly one| Use[Use that label]
  Count -->|more than one| Prec[Resolve by precedence:<br/>in-progress &gt; planned &gt; backburner &gt; done]
  Count -->|none| Mapped{matches a mapped<br/>legacy label?}
  Mapped -->|yes| UseMapped[Use mapped status]
  Mapped -->|no| Default[Default → Planned]
```

### Write rule (atomic-safe ordering)

To never leave an issue statusless: **add target label first, then remove other `terragon/*` labels.** If the remove step fails, the next read resolves by precedence and a later sync cleans up.

---

## 7. Key Flows

### Move issue (drag-drop, optimistic + rollback)

```mermaid
sequenceDiagram
  participant UI as Board UI
  participant SA as moveIssue (Server Action)
  participant GH as GitHub REST

  UI->>UI: Optimistically move card to target column
  UI->>SA: moveIssue(repo, #, targetStatus)
  SA->>GH: Add target terragon/* label
  SA->>GH: Remove other terragon/* label(s)
  alt auto_close_done && target == Done
    SA->>GH: Close issue
  end
  GH-->>SA: ok
  SA-->>UI: success → confirm card
  Note over UI,GH: On any failure, SA returns error →<br/>UI reverts card + shows specific toast
```

### Batch grooming update (partial success)

```mermaid
flowchart TB
  Sel[Selected issues + change set] --> Plan[Grooming Service:<br/>build per-issue plan]
  Plan --> Pool{Concurrency pool<br/>≤3-5 in flight}
  Pool --> Apply[Apply labels / assignee / milestone]
  Apply -->|2xx| OK[record success]
  Apply -->|error / rate-limit| Retry{retryable?}
  Retry -->|yes| Backoff[backoff + requeue]
  Retry -->|no| Fail[record failure + reason]
  Backoff --> Pool
  OK --> Done{pool drained?}
  Fail --> Done
  Done -->|no| Pool
  Done -->|yes| Summary[Return summary:<br/>'6 of 7 updated · #148 failed: no permission']
```

### Sync (V1 on-demand → V2 webhooks)

```mermaid
flowchart LR
  subgraph V1[V1 — on demand]
    Open[Open repo] --> Fetch[Fetch issues]
    Mut[After mutation] --> Revalidate[Revalidate board]
    Manual[Manual refresh] --> Fetch
  end
  subgraph V2[V2 — webhooks]
    GH[GitHub events:<br/>issues · label · milestone] --> WH[/api/github/webhook/]
    WH --> Verify[Verify signature]
    Verify --> Cache[Update issue_cache]
    Cache --> Push[Revalidate / push to clients]
  end
```

---

## 8. Cross-Cutting Concerns

- **Caching:** server-side cache for repo metadata; TanStack Query for board data on the client; optional `issue_cache` table for fast reload. Revalidate after every mutation.
- **Error handling:** specific, calm messages (`Could not update #142 — milestone no longer exists`), never "Something went wrong." Batch operations always report partial success. Expired/invalid auth → prompt re-login.
- **Security:** all GitHub calls server-side; tokens encrypted at rest and never client-exposed; HTTP-only Secure session cookies; CSRF protection; request minimum scopes; audit every mutation in `sync_events` (user, repo, issue, action, result, timestamp).
- **Performance targets (MVP):** board load <2s (<200 open issues), drag feedback <300ms (optimistic), batch >20 issues shows progressive state, local search <200ms after load.

---

## 9. Routes

```
app/
  (marketing)/page.tsx
  (auth)/login/page.tsx
  (auth)/callback/route.ts
  (app)/layout.tsx
  (app)/prep/page.tsx
  (app)/board/page.tsx
  (app)/grooming/page.tsx
  (app)/milestones/page.tsx
  (app)/my-work/page.tsx
  (app)/settings/page.tsx
api/github/
  callback/  webhook/  repos/  issues/  batch-update/
```

---

## 10. Deployment

```mermaid
flowchart LR
  Dev[Local dev] -->|git push| CI[Vercel build]
  CI --> Prev[Preview deploy]
  CI --> Prod[Production]
  Prod --> Fn[Vercel Functions<br/>Node.js / Fluid Compute]
  Fn --> Neon[(Neon Postgres<br/>via Marketplace)]
  Fn --> GH[(GitHub API)]
  Prod --> Obs[Logs · Sentry · audit table]
```

- **Hosting:** Vercel (standard Node.js / Fluid Compute runtime — not edge; see validation Tech Corrections).
- **Database:** Neon Postgres via Vercel Marketplace (Vercel Postgres is deprecated). Drizzle ORM recommended.
- **Observability:** Vercel logs + Sentry + `sync_events` audit table.
