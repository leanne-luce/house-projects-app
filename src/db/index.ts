// Uses postgres.js against a standard Postgres connection string, rather than
// Neon's HTTP-only driver. DEVIATION from the original plan (flagged, not
// silent): this works identically against local Postgres for development and
// testing, and against Neon's regular pooled connection string in
// production/deploy — Neon speaks the standard wire protocol too, not just
// HTTP. That gives a real local dev loop without needing cloud credentials
// for every iteration, at no cost to how this deploys.
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and fill in a Postgres connection string (local, or your Neon project's pooled connection string)."
  );
}

// prepare: false — Neon's pooled ("-pooler") endpoint fronts connections
// with a PgBouncer-style transaction pooler, which caches server-side
// prepared statements by query text across different client connections.
// With it left on, a query's plan can get cached against the schema as it
// existed the first time that exact query text ran and keep being served
// stale after a schema change, even to brand-new deployments/connections —
// this is Neon's own documented recommendation for pooled connections.
const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
export const db = drizzle(client, { schema });
