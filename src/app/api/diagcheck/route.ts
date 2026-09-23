import { db } from "@/db";
import { sql } from "drizzle-orm";

// TEMPORARY — runs the additive schema fix (this session's new columns/join
// tables) against whatever database this deployment's own DATABASE_URL
// actually points to, using the app's own already-correct connection. Also
// backfills the new join tables from the old detailId columns so existing
// real photos/inspiration images keep their associations. Purely additive:
// ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS / DROP NOT NULL,
// nothing destructive, nothing drops or overwrites existing data. Remove
// this route after use.
export async function GET() {
  const before = await db.execute(
    sql`select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name`
  );

  await db.transaction(async (tx) => {
    await tx.execute(sql`ALTER TABLE houses ADD COLUMN IF NOT EXISTS down_payment numeric`);

    await tx.execute(sql`ALTER TABLE details ADD COLUMN IF NOT EXISTS is_furniture boolean NOT NULL DEFAULT false`);
    await tx.execute(sql`ALTER TABLE details ADD COLUMN IF NOT EXISTS target_date text`);

    await tx.execute(sql`ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS due_date text`);
    await tx.execute(sql`ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS note text`);

    await tx.execute(sql`ALTER TABLE progress_photos ALTER COLUMN detail_id DROP NOT NULL`);
    await tx.execute(
      sql`ALTER TABLE progress_photos ADD COLUMN IF NOT EXISTS room_id text REFERENCES rooms(id)`
    );

    await tx.execute(sql`ALTER TABLE board_images ALTER COLUMN detail_id DROP NOT NULL`);
    await tx.execute(
      sql`ALTER TABLE board_images ADD COLUMN IF NOT EXISTS house_id text REFERENCES houses(id)`
    );

    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS progress_photo_details (
        id text PRIMARY KEY,
        progress_photo_id text NOT NULL REFERENCES progress_photos(id),
        detail_id text NOT NULL REFERENCES details(id),
        created_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `);
    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS board_image_details (
        id text PRIMARY KEY,
        board_image_id text NOT NULL REFERENCES board_images(id),
        detail_id text NOT NULL REFERENCES details(id),
        created_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `);
    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS board_image_rooms (
        id text PRIMARY KEY,
        board_image_id text NOT NULL REFERENCES board_images(id),
        room_id text NOT NULL REFERENCES rooms(id),
        created_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `);

    // Backfill join tables from the old detailId columns so existing real
    // photos/images keep their associations under the new many-to-many model.
    await tx.execute(sql`
      INSERT INTO progress_photo_details (id, progress_photo_id, detail_id, created_at)
      SELECT gen_random_uuid()::text, id, detail_id, now()
      FROM progress_photos
      WHERE detail_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM progress_photo_details pd
          WHERE pd.progress_photo_id = progress_photos.id AND pd.detail_id = progress_photos.detail_id
        )
    `);
    await tx.execute(sql`
      INSERT INTO board_image_details (id, board_image_id, detail_id, created_at)
      SELECT gen_random_uuid()::text, id, detail_id, now()
      FROM board_images
      WHERE detail_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM board_image_details bd
          WHERE bd.board_image_id = board_images.id AND bd.detail_id = board_images.detail_id
        )
    `);
    await tx.execute(sql`
      UPDATE board_images
      SET house_id = d.house_id
      FROM details d
      WHERE board_images.detail_id = d.id AND board_images.house_id IS NULL
    `);
  });

  const after = await db.execute(
    sql`select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name`
  );
  const housesCols = await db.execute(
    sql`select column_name from information_schema.columns where table_name = 'houses' order by ordinal_position`
  );
  const counts = await db.execute(sql`
    select
      (select count(*) from houses) as houses,
      (select count(*) from details) as details,
      (select count(*) from progress_photos) as progress_photos,
      (select count(*) from progress_photo_details) as progress_photo_details,
      (select count(*) from board_images) as board_images,
      (select count(*) from board_image_details) as board_image_details
  `);

  return Response.json({
    tablesBefore: before.map((r) => r.table_name),
    tablesAfter: after.map((r) => r.table_name),
    housesColumns: housesCols.map((r) => r.column_name),
    rowCounts: counts[0],
  });
}
