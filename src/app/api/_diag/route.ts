import { db } from "@/db";
import { sql } from "drizzle-orm";

// TEMPORARY diagnostic route — added to track down a mismatch between the
// database this session verified directly and whatever database the live
// deployment actually queries. Sits behind the normal passphrase gate (no
// changes to proxy.ts), so only reachable already-logged-in. Remove after
// use.
export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  const hostMatch = dbUrl.match(/@([^/]+)\//);
  const host = hostMatch ? hostMatch[1] : "unparseable";

  const conn = await db.execute(sql`select current_database() as db, inet_server_addr() as addr`);
  const cols = await db.execute(
    sql`select column_name from information_schema.columns where table_name = 'houses' order by ordinal_position`
  );
  const tables = await db.execute(
    sql`select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name`
  );

  return Response.json({
    envHost: host,
    conn: conn,
    housesColumns: cols.map((r) => r.column_name),
    tables: tables.map((r) => r.table_name),
  });
}
