import "server-only";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

// Storage abstraction: uses Vercel Blob when BLOB_READ_WRITE_TOKEN is
// configured (production), and falls back to local disk + a small route
// handler (src/app/api/uploads/[...path]/route.ts) when it isn't. This
// keeps image upload flows (mood board, reference collection, progress
// photos, receipts once Phase 4 lands) fully testable in local development
// without needing a Vercel project first — the same reasoning as the DB
// driver swap in src/db/index.ts, flagged in PLAN.md. Deploying with a real
// BLOB_READ_WRITE_TOKEN set switches this to real Blob storage with no code
// changes needed.

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".uploads");

export async function saveAsset(
  file: File
): Promise<{ url: string; contentType: string; sizeBytes: number }> {
  const contentType = file.type || "application/octet-stream";
  const sizeBytes = file.size;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`assets/${crypto.randomUUID()}-${file.name}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });
    return { url: blob.url, contentType, sizeBytes };
  }

  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${crypto.randomUUID()}-${safeName}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(LOCAL_UPLOAD_DIR, filename), buf);
  return { url: `/api/uploads/${filename}`, contentType, sizeBytes };
}
