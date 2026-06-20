# Quickstart

Get Terragon running locally in a few minutes. This path uses **demo data** (no GitHub or database calls needed to look around).

```bash
git clone https://github.com/vedanta/terragon.git
cd terragon
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:3000** → **Open the board**. You'll see the seeded demo board, grooming table, issue drawer, and the ⌘K command palette.

> Demo mode (`USE_FIXTURES=true`, the default) needs no credentials. The board, grooming, drawer, and palette all work against seeded data.

## Run against your own GitHub repo

1. Create a GitHub OAuth App and a Postgres database, and fill in `.env` — see [`installation.md`](./installation.md).
2. `npm run db:migrate`
3. Set `USE_FIXTURES=false` and restart `npm run dev`.
4. Sign in with GitHub, then pick a repository in **Settings**.

Your repo's issues now load into the board; drag a card to change status, edit issues in the drawer, and bulk-edit in Grooming.
