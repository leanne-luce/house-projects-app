import { db } from "@/db";
import { sql } from "drizzle-orm";

// force-dynamic: a bare `GET` handler with no dynamic API calls is eligible
// for static rendering in the App Router, which means Next.js can execute
// it once (at build time or on first request) and serve that cached
// response forever after — every subsequent hit replaying stale JSON
// without re-running a single statement. That's almost certainly why
// earlier hits to this route stopped actually reaching the database:
// nothing here reads cookies/headers/searchParams, so nothing signaled
// "run this per-request." Every other data-fetching page in this app
// already opts out the same way (see e.g. src/app/(app)/houses/page.tsx).
export const dynamic = "force-dynamic";

// TEMPORARY one-off migration endpoint. Local dev's Postgres gets schema
// changes applied directly (via psql) as each feature is built, but nothing
// has yet reached whatever database production actually connects to — the
// Neon SQL editor session used to try to fix the first one (rooms.group)
// turned out to be against a different branch/project. Running this through
// the app itself sidesteps that: it uses the same `db` client (and thus the
// same DATABASE_URL) that already serves every other query correctly.
//
// Safe to hit more than once (IF NOT EXISTS / duplicate_object guards).
// Sits behind the same passphrase gate as the rest of the app (src/proxy.ts
// covers /api routes too) — no separate auth check needed here, same as
// src/app/api/uploads/[...path]/route.ts.
//
// Covers, in order added: rooms.group (Interior/Exterior/Utility), then
// house_palette_colors (Color Palette section), then detail_palette_colors
// (Detail page Colors section) plus its one-time backfill from the older
// paletteSwatches freeform swatches — matched to a house palette color by
// name substring; anything that doesn't match (e.g. a swatch labeled for a
// material like "Cedar" that was never logged as a paint color) is left
// alone in paletteSwatches, nothing is dropped. The backfill's NOT EXISTS
// guard makes it safe to run again without creating duplicate links.
//
// ...then material_items.product_url / retailer_name (product links). No
// backfill needed there — both are brand-new optional fields, existing
// materials just get NULL, which is exactly "stays valid."
//
// This route has grown a step for every feature that's touched the schema
// (four now) because production's DATABASE_URL can't be read or matched
// against Neon's console from outside the app — this is the only place
// that's confirmed to reach the right database. Worth replacing with a
// real migration-on-deploy step before the next one.
//
// DELETE THIS ROUTE once /houses and /detail/[id] are confirmed working in
// production.
export async function GET() {
  await db.execute(sql`ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "group" text NOT NULL DEFAULT 'interior'`);

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "rooms" ADD CONSTRAINT "room_group_check" CHECK ("group" in ('interior','exterior','utility'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await db.execute(sql`
    UPDATE rooms SET "group" = 'exterior'
    WHERE "group" = 'interior' AND name ~* '(porch|patio|yard|garden|driveway|deck|roof|siding|fence|exterior)'
  `);

  await db.execute(sql`
    UPDATE rooms SET "group" = 'utility'
    WHERE "group" = 'interior' AND name ~* '(garage|utility|laundry|storage|mechanical|furnace|hvac|basement|attic)'
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "house_palette_colors" (
      "id" text PRIMARY KEY,
      "house_id" text NOT NULL REFERENCES "houses"("id"),
      "name" text NOT NULL,
      "hex" text NOT NULL DEFAULT '#9D8B5E',
      "brand" text,
      "color_code" text,
      "finish" text NOT NULL DEFAULT 'flat',
      "where_used" text,
      "notes" text,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "house_palette_color_hex_check" CHECK ("hex" ~ '^#[0-9A-Fa-f]{6}$'),
      CONSTRAINT "house_palette_color_finish_check" CHECK ("finish" in ('flat','matte','eggshell','satin','semi-gloss','gloss'))
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "detail_palette_colors" (
      "id" text PRIMARY KEY,
      "detail_id" text NOT NULL REFERENCES "details"("id"),
      "palette_color_id" text NOT NULL REFERENCES "house_palette_colors"("id"),
      "role" text,
      "created_at" timestamptz NOT NULL DEFAULT now()
    )
  `);

  const backfilled = await db.execute(sql`
    INSERT INTO detail_palette_colors (id, detail_id, palette_color_id, role, created_at)
    SELECT gen_random_uuid()::text, ps.detail_id, hpc.id, NULL, now()
    FROM palette_swatches ps
    JOIN details d ON d.id = ps.detail_id
    JOIN house_palette_colors hpc
      ON hpc.house_id = d.house_id
      AND ps.label ILIKE '%' || hpc.name || '%'
    WHERE NOT EXISTS (
      SELECT 1 FROM detail_palette_colors dpc
      WHERE dpc.detail_id = ps.detail_id AND dpc.palette_color_id = hpc.id
    )
    RETURNING detail_id, palette_color_id
  `);

  const unmatchedSwatches = await db.execute(sql`
    SELECT d.name AS detail_name, ps.label, ps.hex
    FROM palette_swatches ps
    JOIN details d ON d.id = ps.detail_id
    WHERE NOT EXISTS (
      SELECT 1 FROM house_palette_colors hpc
      WHERE hpc.house_id = d.house_id AND ps.label ILIKE '%' || hpc.name || '%'
    )
  `);

  await db.execute(sql`ALTER TABLE "material_items" ADD COLUMN IF NOT EXISTS "product_url" text`);
  await db.execute(sql`ALTER TABLE "material_items" ADD COLUMN IF NOT EXISTS "retailer_name" text`);

  const rooms = await db.execute(sql`SELECT name, "group" FROM rooms ORDER BY created_at`);
  const paletteColors = await db.execute(sql`SELECT name, hex FROM house_palette_colors ORDER BY created_at`);
  const materialsWithLinks = await db.execute(
    sql`SELECT description, product_url, retailer_name FROM material_items WHERE product_url IS NOT NULL`
  );

  // Explicit no-store: repeated GET hits to this route kept coming back
  // with an identical, stale response body even across deploys that
  // changed what it returns — pointing at a cache (browser or edge/CDN)
  // serving an old response rather than this handler re-running. This is
  // belt-and-suspenders with `dynamic = "force-dynamic"` above.
  return Response.json(
    { ok: true, rooms, paletteColors, backfilled, unmatchedSwatches, materialsWithLinks },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
