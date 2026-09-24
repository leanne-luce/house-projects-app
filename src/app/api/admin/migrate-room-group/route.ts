import { db } from "@/db";
import { sql } from "drizzle-orm";

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
// house_palette_colors (Color Palette section).
//
// DELETE THIS ROUTE once /houses is confirmed working in production.
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

  const rooms = await db.execute(sql`SELECT name, "group" FROM rooms ORDER BY created_at`);
  const paletteColors = await db.execute(sql`SELECT name, hex FROM house_palette_colors ORDER BY created_at`);

  return Response.json({ ok: true, rooms, paletteColors });
}
