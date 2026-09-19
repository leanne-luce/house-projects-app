import "server-only";
import { put } from "@vercel/blob";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

// Storage abstraction: uses Vercel Blob when BLOB_READ_WRITE_TOKEN is
// configured (production), and falls back to local disk + a small route
// handler (src/app/api/uploads/[...path]/route.ts) when it isn't. This
// keeps image upload flows (mood board, reference collection, progress
// photos, receipts) fully testable in local development without needing a
// Vercel project first — the same reasoning as the DB driver swap in
// src/db/index.ts, flagged in PLAN.md. Deploying with a real
// BLOB_READ_WRITE_TOKEN set switches this to real Blob storage with no code
// changes needed.

// Configurable so a test run can point at a completely separate folder from
// real local usage (.uploads-test vs .uploads) — see PLAN.md's "Test/real
// data isolation" section for why this exists: an incident where test
// cleanup commands deleted real uploaded files because test and real data
// shared one folder. Never hardcode ".uploads" elsewhere; always go through
// this.
// turbopackIgnore: process.env.UPLOAD_DIR makes this path non-literal, which
// makes Next.js's build-time file tracer fall back to tracing the entire
// project as output — a warning in local dev, but this actually failed the
// production build on Vercel ("Failed to collect page data for
// /asset/[id]"). This directory is only ever read from/written to in local
// dev anyway (real deploys use Vercel Blob instead, see saveBuffer below),
// so there's nothing here worth tracing.
const LOCAL_UPLOAD_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOAD_DIR || ".uploads");

async function saveBuffer(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<{ url: string; contentType: string; sizeBytes: number }> {
  const sizeBytes = buffer.byteLength;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`assets/${crypto.randomUUID()}-${filename}`, buffer, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });
    return { url: blob.url, contentType, sizeBytes };
  }

  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const outName = `${crypto.randomUUID()}-${safeName}`;
  await writeFile(path.join(/* turbopackIgnore: true */ LOCAL_UPLOAD_DIR, outName), buffer);
  return { url: `/api/uploads/${outName}`, contentType, sizeBytes };
}

export async function saveAsset(
  file: File
): Promise<{ url: string; contentType: string; sizeBytes: number }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return saveBuffer(buffer, file.name, file.type || "application/octet-stream");
}

// For callers that already have the raw bytes in hand for another reason
// (receipts need the buffer anyway to compute a dedupe hash) — avoids
// reading the same File twice.
export async function saveAssetBuffer(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<{ url: string; contentType: string; sizeBytes: number }> {
  return saveBuffer(buffer, filename, contentType);
}

// Re-reads an already-stored asset's bytes (needed to re-run OCR on a
// receipt without asking for a fresh upload). Handles both backends: a
// real URL (Vercel Blob) gets fetched over HTTP, a local path
// (/api/uploads/<name>, the dev fallback) is read straight off disk.
export async function readAssetBuffer(url: string): Promise<Buffer> {
  if (/^https?:\/\//i.test(url)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch asset (${res.status})`);
    return Buffer.from(await res.arrayBuffer());
  }
  // turbopackIgnore: a fully dynamic (non-literal) path passed to
  // readFile/writeFile makes Next.js's build-time file tracer try to
  // include the entire project as a fallback — harmless as a warning
  // locally, but this actually failed the production build on Vercel
  // ("Failed to collect page data for /asset/[id]"). This path is dev-only
  // anyway (only reached when BLOB_READ_WRITE_TOKEN isn't set), so there's
  // nothing here for the tracer to usefully include.
  const filename = path.basename(url);
  return readFile(path.join(/* turbopackIgnore: true */ LOCAL_UPLOAD_DIR, filename));
}
