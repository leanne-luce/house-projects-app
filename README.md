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

Phase 1 (Foundation) and Phase 2 (House/Room/Detail structure, Inbox,
Materials/Spend) are done and verified end-to-end against a real Postgres
database. That's the part that alone replaces the spreadsheet:

- Houses/Rooms/Details tree — add/edit/move/delete at every level, with
  rollup badges (detail count, spend) and cascading deletes that move
  details up rather than destroying them where the prototype did the same.
- Quick capture + Inbox — text and/or photo, filing to an existing Detail or
  to a brand-new House/Room/Detail created on the spot.
- Horizon view, grouped and sorted by timeframe.
- Detail page — editable name/status/timeframe, Estimated-vs-Actual budget
  bars (with the color flip on overspend), Materials plan, Actual spend log,
  Checklist with a progress bar, Move, and a Danger Zone delete.

Deviation from the original driver plan: `src/db/index.ts` uses `postgres.js`
against a standard Postgres connection string rather than Neon's HTTP-only
driver — this works identically against local Postgres (used for all
development/testing so far) and Neon's regular pooled connection string in
production, at no cost to how this deploys. See the comment in that file.

Phase 3 (mood board & references, palette, progress photos, real image
storage) is also done. Mood board and Reference & assembly are one merged
visual section (`references-panel.tsx`), with a click-to-toggle badge on
each image to reclassify it between Mood and Assembly rather than two
separate collections. That section can also pull images straight from a
linked Pinterest board's public page (`src/lib/pinterest.ts`) — a
best-effort scrape, not the official API, chosen for zero setup over
Pinterest's OAuth review process; see that file's header comment for the
tradeoffs. File storage uses a small abstraction (`src/lib/storage.ts`):
Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set, otherwise local disk plus a
route handler, so image upload flows are testable locally without a Vercel
project yet. Uploaded images are compressed client-side (resize to ~1600px,
JPEG ~78% quality) before they leave the browser, per the free-tier cost
model.

Phase 4 (receipts + server-side OCR) is next.

## Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run db:generate` — generate a Drizzle migration from schema changes
- `npm run db:push` — push the current schema straight to the database (fine for solo development)
- `npm run db:studio` — Drizzle Studio, a local DB browser
