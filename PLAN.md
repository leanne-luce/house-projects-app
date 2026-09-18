# House Projects Hub — rebuild plan

## Context

Leanne has a validated Claude.ai prototype (`house-projects-hub_1.html`, ~1,860 lines, read in full) that replaced a spreadsheet + Google Slides + Pinterest workflow for tracking renovation work across two properties. It works, but it's built on a per-artifact document store with a 5,000-doc cap, no transactions, client-side-only OCR, and no way to receive webhooks — so several real gaps (silent write failures, weak OCR, no Pinterest sync, no SMS capture) can't be closed without a real server. The ask is to rebuild it as a deployed full-stack app, using the prototype as the source of truth for data model, interaction design, and visual language — not as a mockup to reinterpret.

The prototype encodes real decisions in its code: the `safeAdd/safeUpdate/safeDelete` write-queue-per-document pattern exists specifically to route around store-level races; the receipt OCR heuristic (`parseReceiptLines`, `runOCR`) exists specifically because there's no server to send the image to; the scratchpad's tiny expression language (`evalMathExpr`, `renderScratchpad`, `computeScratchpadVars`) is a deliberately scoped calculator, not a placeholder. This plan carries all of that forward and only deviates where the client-only constraints that shaped it no longer apply.

## Cost model — this stays on free tiers, with two flagged exceptions

Leanne asked to keep this to free services and to scrutinize whether the free tiers actually hold up rather than assuming. Researched current (Sept 2026) terms for every service below before finalizing the stack:

| Service | Free tier | Card required? | What happens if exceeded |
|---|---|---|---|
| Vercel (hosting) | Hobby plan: 100GB bandwidth, 1M function invocations, 4 CPU-hrs/mo, up to 60–300s function duration | No | Resource pauses until the 30-day window resets — no bill. Hobby is restricted to personal/non-commercial use, which this is. |
| Neon (Postgres) | 0.5GB storage, 100 compute-hours/month, scale-to-zero | No | Compute suspends until next billing cycle — no bill, just a pause. |
| Vercel Blob (file storage) | 1GB storage, 10GB transfer/month | No (same Vercel account) | Uploads fail past the cap; no auto-bill on Hobby. |
| tesseract.js (OCR) | Open-source npm package, runs on your own compute | No | N/A — it's software, not a hosted service |
| Cloudflare Email Routing + Workers (Phase 5 capture) | Free tier is generous for this volume | No (routing is free without adding billing) | N/A at personal-email volume |

**Two things don't fit a strict $0 forever:**

1. **Image storage headroom.** Vercel Blob's free 1GB is real but small for years of receipt/mood-board/progress photos. Mitigated by compressing every upload client-side before it leaves the browser (resize to ~1600px longest edge, re-encode to ~70–80% quality JPEG/WebP, typically 150–400KB per photo) — that stretches 1GB to roughly 2,500–6,000 photos, which should cover both properties for a long time. If it's ever outgrown, Cloudflare R2 (10GB free, free egress) is the upgrade path — but flagging honestly: R2 requires adding a credit card to the Cloudflare account, and unlike Neon/Vercel it auto-bills for overage rather than just pausing, so it should only be adopted alongside a spend-cap alert, not casually. Not part of the initial build.
2. **OCR quality vs. cost.** A vision-capable paid API (Claude, GPT-4o, Google Cloud Vision) would extract receipt line items more reliably than tesseract — but every one of them costs money from the first call (Anthropic's API has no free tier at all; Google Cloud Vision's "first 1,000 units free" still requires an active billing account with a card on file). Given the stated preference, the plan below defaults to **server-side tesseract.js** — the same free OCR engine the prototype already uses, just moved off the browser into a Vercel function. That alone fixes the "no retry logic, no server fallback" complaint in section 3 at zero cost; it does not fix the underlying OCR-quality ceiling. A paid vision API stays available as an explicit later opt-in (cost would run a few cents a month at this household's receipt volume) if quality becomes the priority over cost.

Everything else in this plan runs at genuine $0/month.

## Proposed stack

**Next.js (App Router, TypeScript) on Vercel, with Neon Postgres via Drizzle ORM, Vercel Blob for images/receipts, a self-hosted passphrase-gated login (no third-party auth vendor), and server-side tesseract.js for receipt OCR.**

Rationale for each call:

- **Next.js + Vercel** — server actions give transactional, atomic mutations with no separate REST layer to hand-roll, which directly retires the write-queue-per-document hack (`writeQueues` in the prototype) — Postgres transactions replace it outright. Deploys straightforward from a single repo; API routes double as webhook receivers for Phase 5 (email capture, and later Pinterest). Confirmed above to run entirely on the free Hobby tier for this use.
- **Neon Postgres** — matches the brief's own suggestion; confirmed free tier (0.5GB storage / 100 CU-hrs/mo) comfortably covers a single-user app's row volume (no images live in Postgres — those go to Blob). **Implementation update (flagged deviation):** the app connects via `postgres.js` over a standard connection string (`src/db/index.ts`) rather than Neon's HTTP-only driver. Neon accepts normal Postgres connections too, not just HTTP — so this deploys identically, and it additionally means development happens against a real local Postgres database instead of needing cloud credentials for every iteration. Everything built so far (Phase 1 and 2) has been tested against a local Postgres instance this way.
- **Drizzle ORM** over Prisma — schema-as-code maps cleanly onto section 6's field names, lighter runtime and better cold-start behavior on serverless than Prisma's engine, and its Neon HTTP driver is first-class. This is a close call; Prisma would also work fine if preferred later. No cost difference either way — both are free, open-source.
- **Vercel Blob** for receipt photos, mood-board images, and progress photos — no separate account or card beyond the Vercel account already needed for hosting. See the 1GB caveat above; client-side compression is part of the build, not an afterthought.
- **A self-hosted passphrase gate, not a third-party auth vendor** — this is a single-owner tool (section 9) with no need for OAuth, magic-link email delivery, or a user table. A single passphrase stored as an env var, checked against a small login form, setting a signed session cookie, satisfies the multi-device requirement (phone + desktop) the prototype couldn't solve, with zero external dependency, zero cost, and no email-deliverability risk of getting locked out. (Auth.js's Credentials provider can supply the session-cookie plumbing if useful, but no email provider or OAuth app gets provisioned.)
- **Server-side tesseract.js for receipt OCR**, replacing the browser-side tesseract.js call — same free engine, moved into a Vercel Node serverless function so it isn't dependent on a CDN load succeeding in whatever browser Leanne happens to be using, and so it can retry on failure. Vercel Hobby's function duration (60–300s depending on whether Fluid Compute is enabled) comfortably covers a multi-second OCR pass; this will get load-tested early in Phase 4 rather than assumed. The manual "add item by hand" fallback stays exactly as designed, since this still isn't going to be perfect.
- **No Twilio.** SMS/MMS capture (section 8's highest-value deferred item) is real money: a Twilio number runs $1.15+/month, plus per-message fees, plus US carrier compliance fees (~$10–15/month) for business-grade SMS. Phase 5 instead proposes Cloudflare Email Routing (free) forwarding to a Cloudflare Email Worker (free tier) that POSTs to `/api/inbox` — Leanne emails a photo or note from her phone into the inbox instead of texting it, which serves the same "capture away from the desk" need at zero recurring cost. True SMS via Twilio stays available as a fallback if email capture proves insufficient, with its real cost stated up front rather than discovered later.

## Data model (Postgres schema)

Every table below maps 1:1 to section 6's field names — kept, not renamed, so the mapping stays legible against the prototype. Primary keys are text/UUID (matching the prototype's opaque `uid()` string ids). All enums are implemented as Postgres `text` + `check` constraints (portable, easy to extend later) rather than native `enum` types.

`houses`, `rooms`, `details`, `checklist_items`, `material_items`, `line_items`, `inbox_items`, `board_images`, `palette_swatches`, `progress_photos`, `receipts`, `receipt_line_items` — same columns as section 6, same enum value strings (`not_started|in_progress|done|on_hold`, `idea|decided|need_to_source|purchased`, `note|image`, `mood|reference`, `before|during|after`, `new|processing|logged`, `pending|assigned|dismissed`).

### Deviations from section 6 (flagged, not silent)

1. **New `assets` table** — `id, url, contentType, sizeBytes, uploadedAt`. The prototype's `assetId`/`sourceUrl` fields pointed into an opaque per-artifact blob store (`window.claude.use("assets")`); a real app needs an actual record of what got uploaded and where it lives (a Vercel Blob URL). Every existing `*AssetId` field (on `Receipt`, `LineItem.receiptAssetId`, `InboxItem.assetId`, `BoardImage.assetId`, `ProgressPhoto.assetId`) becomes a foreign key into `assets` instead of an opaque string. `BoardImage.sourceUrl` (pasted image URL) is unaffected — it stays a plain nullable string, no asset row needed.
2. **`timeframeGranularity` empty string → nullable** — the prototype used `''` to mean "unscheduled." Postgres represents that as `NULL` instead; the UI behavior (falls into "Someday / unscheduled" bucket on the Horizon view) is unchanged, only the sentinel value changes.
3. **New `sessions` table (minimal)** — just enough to back the passphrase-gate's signed session cookie; not part of the section 6 domain model, purely plumbing, and there's no real `users` table since there's exactly one allowed session, not an account system.
4. **`inbox_items.source` (new, nullable, additive)** — `manual | email | extension`, defaulting to `manual`. Needed so Phase 5's email-based capture (see cost model above — replacing SMS to avoid Twilio's recurring cost) and a future Chrome extension can tag where an item came from without changing existing behavior for anything filed by hand today.

### Derived values — computed at read time, not stored

Mirrors the prototype's pure functions exactly, just moved server-side into a `lib/derived.ts` (or equivalent query layer):

- `roughCost(detailId)` = Σ(roughQuantity × roughUnitCost) over that Detail's `material_items` — same as prototype's `roughCost()`.
- `actualCost(detailId)` = Σ(cost) over `line_items` — same as `actualCost()`.
- Displayed "Estimated spend" = `estimatedSpend` if set, else `roughCost()` — same fallback as the Detail hero's budget bar.
- House/Room rollups (`houseRollup`, `roomRollup`) = same aggregate-over-descendant-Details logic, either as a query-time aggregation or a lightweight SQL view if list-page performance ever needs it (unlikely at personal scale — a handful of houses/rooms/details).
- Receipt auto-flip to `logged` — same trigger condition as `maybeMarkReceiptLogged()`: after every assign/dismiss action, check if all of that receipt's `receipt_line_items` are non-`pending`, and if so flip `receipts.status` to `logged` inside the same transaction as the assign/dismiss write (this is exactly the class of "silent write failure" bug a real transaction fixes — the prototype had to do this as two separate awaited writes with no atomicity).
- Duplicate-receipt detection — same SHA-256-of-file-bytes hash, computed server-side on upload (can also compute client-side for early UX feedback), same "warn, don't block" UI treatment. Same caveat carried into the UI copy: this only catches literal duplicate file uploads, not two photos of the same paper receipt.

## App architecture

- Routes roughly mirror the prototype's tabs: `/houses` (tree view), `/inbox`, `/horizon`, `/receipts`, `/overview`, and `/detail/[id]` as a real full page (not a modal — this matches the prototype's own choice to make the Detail page a first-class view, not a dialog).
- Mutations go through Next.js Server Actions, one per prototype action (`addHouse`, `updateDetail`, `assignReceiptLineItem`, etc.) — same names, same signatures where practical, so the mapping from prototype to rebuild stays traceable. Optimistic UI updates (React's `useOptimistic` or manual state) replace the prototype's "mutate local state immediately, reconcile on write result" pattern from `safeUpdate`, with a toast on failure reusing the same friendly-error philosophy as `friendlyErr()`.
- The scratchpad math engine (`evalMathExpr`, `renderScratchpad`, `computeScratchpadVars`, `humanizeVarName`) ports over nearly verbatim as a client-side TS module — it's a pure, self-contained calculator with no dependency on the storage layer, no reason to move it server-side. Autosave-on-blur/debounce behavior carries over unchanged.
- A `POST /api/inbox` endpoint (personal API token, not full OAuth) gets built in Phase 1 alongside the UI's own quick-capture action — trivial marginal cost now, and it's the exact hook a future Chrome extension (explicitly scoped out of this rebuild, section 8) or other automation would need later.

## Visual language

Reuse the prototype's `:root` CSS custom properties verbatim (light block at the top of the `<style>` tag, dark block under `prefers-color-scheme`/`[data-theme="dark"]`) — same token names, same values: `--bg #FBF8F3`, `--accent #9D8B5E` / `--accent-strong #7A6A45`, `--good` (sage, done), `--warn` (amber, in-progress), `--danger` (muted rust, on-hold), `--radius`/`--radius-sm`, `--shadow`. Translate directly into either CSS custom properties on `:root` in `globals.css` or a matching Tailwind theme extension — not reinvented. Carry over the specific UI patterns the brief calls out as deliberate: status pills (`.status-pill` + per-status classes), the hero's left accent bar that recolors with status (`.db-hero::before` keyed off `--status-color`), and the horizontal Estimated-vs-Actual comparison bar that flips fill color to `--danger` the instant actual exceeds estimated.

## Build phases

Each phase is independently usable, same order the prototype itself was built in (section 11):

1. **Foundation** — repo scaffold, Drizzle schema + migrations for all tables above, passphrase-gate login, Vercel deploy pipeline, base layout carrying the design tokens.
2. **Structure + Inbox + Materials/Spend** — House→Room→Detail tree with rollups, quick-capture + Inbox tab (file/create-on-the-spot flow), Detail page hero (status, timeframe, budget bars), Materials plan, Actual spend log, flat Checklist, scratchpad. This alone replaces the spreadsheet.
3. **Visual panels** — Mood board / Reference & assembly (shared image-collection mechanic, kept as separate collections per the brief's own reasoning), Color palette, Progress photos (Before/During/After), all backed by Vercel Blob uploads with client-side compression before upload (see cost model above).
4. **Receipts + server OCR** — upload → hash → dedupe warning → server-side tesseract.js extraction → pending line items → assign/dismiss (both from the Receipts tab and from a Detail page's "Unassigned receipt items" panel) → auto-flip to `logged`. Manual "add item by hand" always available. Load-test the OCR function's duration/memory against Vercel's Hobby limits early in this phase rather than assuming it fits.
5. **Overview dashboard** — active Detail count, month/quarter spend, unfiled inbox count, over-budget Details, materials needing sourcing, upcoming-per-Horizon.
6. **Stretch, sequenced by value (post-MVP, revisit priority with Leanne before starting)**:
   - Email-based mobile capture via Cloudflare Email Routing + Worker → `POST /api/inbox` with `source: 'email'` (the free substitute for the brief's highest-value deferred item, SMS capture — see cost model above for why Twilio is out).
   - Pinterest integration — build a checkpoint into this phase rather than committing now: confirm the OAuth/API complexity is worth it over the manual `pinterestBoardUrl` link before investing in it. No cost concern either way (Pinterest's API itself is free); this checkpoint is about engineering effort, not money.
   - Chrome extension — explicitly a separate build/packaging effort (section 8); the `/api/inbox` token-authenticated endpoint from Phase 2 is what it would call.

## Preserved non-negotiables (section 4)

Every phase respects: nothing requires the level above it to exist first; quick-capture has zero required fields; filing from Inbox is optional and lightweight; reorganizing a Detail's House/Room is normal use, not a fix-up; Details are allowed to sit at wildly different completeness levels permanently, with no nudge toward uniformity; the hierarchy is capped at exactly House → Room (optional) → Detail, with the Checklist as the only sub-breakdown, never deeper nesting.

## Verification

- **Phase 2 (core)**: seed script creates 1-2 houses/rooms/details fixture data; manual QA walks the prototype's own feature list end-to-end (add/move/delete at every level, file an inbox item into a brand-new Detail created on the spot, confirm rollup badges match sums).
- **Derived-value logic**: unit tests for `roughCost`, `actualCost`, the `estimatedSpend` fallback, and the receipt auto-`logged` transition — these are the spots most likely to silently drift from the prototype's behavior.
- **Scratchpad**: port a few of the prototype's own example lines (`board_length = 12`, `boards_needed = ceil(panels_needed / panels_per_board)`) as unit tests against the ported `evalMathExpr`/`computeScratchpadVars`.
- **Receipts/OCR**: manually upload a real receipt photo per property, confirm extracted line items are reasonable, confirm duplicate-upload warning fires on a second upload of the same file, confirm dismiss/assign correctly flips a receipt to `logged` once nothing's left pending, and confirm the OCR function's actual run time/memory stays inside Vercel Hobby's limits under a real photo (not just a small test image).
- **Auth**: confirm the passphrase-gate session works from both a phone and a desktop browser, confirming the multi-device gap the prototype couldn't close.
- **Free-tier headroom**: after Phase 3 (once real photos start accumulating) and again after a few weeks of normal use, check actual Vercel Blob storage, Neon storage/compute-hours, and Vercel function usage against the caps in the cost model table above — confirm the plan is holding, not just that it should in theory.
