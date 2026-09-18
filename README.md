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
  Checklist with a progress bar, a free-text Notes field (any URL in it
  renders as a clickable link), Move, and a Danger Zone delete.

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

Phase 4 (receipts + server-side OCR) is also done. Load-tested tesseract.js
before building around it (see PLAN.md's Phase 4 note): ~350ms warm /
~700ms cold for a full receipt image, comfortably inside any serverless
function budget. One real deployment gotcha found and fixed: tesseract.js
spawns a genuine Node worker_threads worker pointing at a file on disk,
which breaks under Next.js's default bundling ("Cannot find module
.../worker-script/node/index.js") — fixed via `serverExternalPackages` in
next.config.ts, which tells Next.js to require it directly from
node_modules at runtime instead of bundling it.

Deviation from the prototype (flagged): re-scanning a receipt there just
appended newly-found items on top of whatever was already pending, so
clicking "Re-scan" more than once would pile up duplicates. Re-scanning
here clears out still-pending items first (anything already assigned or
dismissed is left alone, since that represents a real decision already
made) before inserting the fresh batch.

Receipts are deliberately never run through the client-side image
compression every other photo upload gets — OCR needs the sharpest text
it can get, and re-encoding at lower quality works against that.

Since Phase 4, four more receipt refinements were added:

- PDF receipts, alongside photos — text extraction via `pdfjs-dist` directly
  (not the `pdf-parse` package, which pulls in a native `@napi-rs/canvas`
  dependency we don't need for plain text extraction). Same
  `serverExternalPackages` fix as tesseract.js was needed here too:
  pdfjs-dist spawns its own worker file, which breaks under Next.js's
  default bundling the same way.
- Dismissed receipt line items can still be assigned to a Detail (or
  restored to pending) instead of being a dead end.
- Receipt line item descriptions and amounts are editable regardless of
  status, on both the Receipts tab and the Detail page's "Unassigned
  receipt items" panel.
- Receipts can be tagged with which store they came from; that vendor
  flows automatically into the LineItem created when one of its items gets
  assigned, so it doesn't need retyping per item.

One more OCR fix: receipt line-item extraction only handled classic
single-line-per-item receipts (description and price on the same line).
Tested against a real emailed Lowe's PDF receipt and found it extracted
zero real items — that receipt's format spreads each item across four
lines (name / qty / item+model numbers / "Unit Price: $X | Subtotal: $Y"),
which the original heuristic can't see, plus two false positives leaked in
from a "Payment $47.00" / "Card Transaction Amount $47.00" section it had
no way to distinguish from a purchased item. `src/lib/ocr.ts` now runs a
second structured-block heuristic alongside the original one, and the
skip-word list was extended to exclude payment-processing lines. Verified
by reconstructing the real receipt's exact structure as a test PDF (not
guessed at) before and after the fix.

Two more additions:

- A receipt's vendor now backfills onto any spend entries already created
  from it, not just future ones — set the vendor after assigning some
  items (or edit it later) and everything created from that receipt
  updates to match.
- Progress photos accept multiple files at once, and video alongside
  photos (a phone clip of a job in progress, not just a still). Along the
  way, found and fixed a real latent bug: Next.js caps a Server Action's
  request body at 1MB by default, which almost certainly meant real,
  uncompressed phone-camera receipt photos were already silently failing
  above that size before this was raised (`experimental.serverActions.bodySizeLimit`
  in `next.config.ts`) — confirmed by successfully uploading a 5.4MB test
  photo afterward. Video isn't compressed (no simple free way to do that
  client-side); this hasn't been verified against a real Vercel deployment,
  where the platform itself may impose its own separate request-size
  ceiling regardless of this setting — if large uploads fail once deployed,
  a client-side direct-to-Blob upload is the fix, bypassing the function
  entirely for the actual bytes.

Phase 5 (Overview dashboard) is next.

## Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run db:generate` — generate a Drizzle migration from schema changes
- `npm run db:push` — push the current schema straight to the database (fine for solo development)
- `npm run db:studio` — Drizzle Studio, a local DB browser
