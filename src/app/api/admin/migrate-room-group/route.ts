import { db } from "@/db";
import { sql } from "drizzle-orm";

// TEMPORARY one-off migration endpoint. The rooms.group column (added for
// the House page's Interior/Exterior/Utility sections) got applied to the
// local dev database but never reached whatever database production
// actually connects to — the Neon SQL editor session used to try to fix it
// was apparently against a different branch/project. Running this through
// the app itself sidesteps that: it uses the same `db` client (and thus the
// same DATABASE_URL) that already serves every other query correctly.
//
// Safe to hit more than once (IF NOT EXISTS / duplicate_object guards).
// Sits behind the same passphrase gate as the rest of the app (src/proxy.ts
// covers /api routes too) — no separate auth check needed here, same as
// src/app/api/uploads/[...path]/route.ts.
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

  const rows = await db.execute(sql`SELECT name, "group" FROM rooms ORDER BY created_at`);

  return Response.json({ ok: true, rooms: rows });
}
