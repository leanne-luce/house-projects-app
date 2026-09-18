# House Projects Hub

A personal renovation/DIY project tracker, rebuilt as a real full-stack app from a validated Claude.ai prototype (`prototype/house-projects-hub.html`). See `PLAN.md` for the full rebuild plan, including the free-tier cost model this stack is designed around.

## Stack

Next.js (App Router, TypeScript) · Neon Postgres via Drizzle ORM · Vercel Blob
for images/receipts · a self-hosted passphrase-gated login (no third-party
auth vendor) · server-side tesseract.js for receipt OCR (Phase 4).

Every service in this stack has a genuinely free tier at this app's scale —
see the plan's "Cost model" section for exactly what was checked and why.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `DATABASE_URL` — a Neon Postgres connection string ([neon.tech](https://neon.tech), free tier, no card required)
   - `SESSION_SECRET` — a long random string, e.g. `openssl rand -base64 32`
   - `APP_PASSPHRASE` — whatever passphrase should gate the app
   - `BLOB_READ_WRITE_TOKEN` — from your Vercel project's Storage tab (not needed until Phase 3)
3. Push the schema to your database: `npm run db:push`
4. `npm run dev` and open `http://localhost:3000`

## Project status

Phase 1 (Foundation) is done: schema, passphrase auth, deploy-ready shell with
the prototype's design tokens carried over, and stub pages for every tab.
Phase 2 (House/Room/Detail structure, Inbox, Materials/Spend) is next.

## Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run db:generate` — generate a Drizzle migration from schema changes
- `npm run db:push` — push the current schema straight to the database (fine for solo development)
- `npm run db:studio` — Drizzle Studio, a local DB browser
