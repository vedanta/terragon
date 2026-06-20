# Installation

Self-host Terragon — local development or your own deployment. For the fastest path to a running demo, see [`quickstart.md`](./quickstart.md).

## Prerequisites

- **Node.js 22+**
- A **GitHub OAuth App** (for sign-in and API access)
- A **Postgres** database — [Neon](https://neon.tech) is recommended (serverless); any Postgres works

## 1. Create a GitHub OAuth App

GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**:

| Field | Value |
|-------|-------|
| Application name | `Terragon (local)` |
| Homepage URL | `http://localhost:3000` |
| Authorization callback URL | `http://localhost:3000/api/auth/callback/github` |

Register it, copy the **Client ID**, and generate a **Client secret**.

> A classic OAuth App allows only **one** callback URL. Use a separate OAuth App per environment (one for local, one per deployed domain).

## 2. Provision a database

Create a Postgres database and copy its connection string (for Neon, use the **pooled** connection string). You'll set it as `DATABASE_URL`.

## 3. Clone and configure

```bash
git clone https://github.com/vedanta/terragon.git
cd terragon
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Required | How to get it |
|----------|----------|---------------|
| `DATABASE_URL` | yes | Your Postgres connection string |
| `AUTH_SECRET` | yes | `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` | yes | OAuth App Client ID |
| `AUTH_GITHUB_SECRET` | yes | OAuth App Client secret |
| `TERRAGON_ENCRYPTION_KEY` | yes | `openssl rand -hex 32` (encrypts GitHub tokens at rest) |
| `USE_FIXTURES` | no | `true` (default) serves demo data; `false` uses live GitHub |

## 4. Apply the database schema

```bash
npm run db:migrate
```

(`npm run db:generate` creates a new migration after you change `db/schema.ts`.)

## 5. Run

```bash
npm run dev          # http://localhost:3000
```

By default the app shows **seeded demo data** and makes no GitHub calls. To work against a real repository: set `USE_FIXTURES=false`, restart, sign in, and pick a repo in **Settings**.

## Deployment (Vercel)

1. Import the repo into Vercel; provision Postgres (Neon via the Marketplace).
2. Create a **production** GitHub OAuth App with callback `https://<your-domain>/api/auth/callback/github`.
3. Set the env vars from step 3 in the Vercel project (Production), with `USE_FIXTURES=false`.
4. Deploy. Apply migrations against the production database (`DATABASE_URL=<prod> npm run db:migrate`).

Terragon runs on the standard Node.js runtime — no edge configuration required.

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run start        # serve a production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run test         # unit tests (vitest)
npm run test:e2e     # end-to-end (playwright)
npm run db:generate  # generate a migration from schema changes
npm run db:migrate   # apply migrations
```

## Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| `redirect_uri is not associated with this application` | The OAuth App's callback URL doesn't match the host you're on. It must be exactly `<origin>/api/auth/callback/github`. Use a separate OAuth App per domain. |
| Sign-in works locally but not on the deployment | Set the env vars on the host, and add a production OAuth App whose callback matches the deploy domain. |
| Board is empty after sign-in | Set `USE_FIXTURES=false` and select a repository in **Settings**. |
| Auth/route-protection errors when self-hosting (not on Vercel) | Ensure `AUTH_SECRET` is set; the app trusts the host for session resolution. |
| DB errors on first run | Run `npm run db:migrate`; confirm `DATABASE_URL` is reachable (Neon needs the pooled string). |
