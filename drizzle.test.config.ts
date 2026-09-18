// Pushes schema to the isolated test database (house_projects_test), never
// the real one. See PLAN.md's "Test/real data isolation" section.
import { defineConfig } from "drizzle-kit";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.test.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.test.local.");
}
if (!process.env.DATABASE_URL.includes("_test")) {
  // A blunt but effective guard: refuse to run against anything whose
  // connection string doesn't look like the test database, in case
  // .env.test.local ever gets edited to point somewhere real by mistake.
  throw new Error(
    `DATABASE_URL in .env.test.local ("${process.env.DATABASE_URL}") doesn't look like a test database (expected it to contain "_test"). Refusing to run — this config should only ever touch the test database.`
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
