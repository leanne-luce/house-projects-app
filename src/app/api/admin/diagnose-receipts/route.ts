import { db } from "@/db";
import { receipts, assets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { readAssetBuffer } from "@/lib/storage";
import { runOcr, extractPdfText } from "@/lib/ocr";

// TEMPORARY diagnostic endpoint for the "receipt stuck at Scanning… forever"
// report. Read-only against `receipts`/`assets` (never touches status) —
// the actual re-run of readAssetBuffer/runOcr/extractPdfText below is done
// live, in this request, so whatever it reports is exactly what a real
// production invocation does, not a guess made from local dev. Same
// force-dynamic + no-store reasoning as migrate-room-group's route.
//
// DELETE THIS ROUTE once the receipts flow is confirmed fixed in production.
export const dynamic = "force-dynamic";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}

export async function GET() {
  const stuck = await db.select().from(receipts).where(eq(receipts.status, "processing"));

  const results = [];
  for (const r of stuck) {
    const [asset] = await db.select().from(assets).where(eq(assets.id, r.assetId)).limit(1);
    const entry: Record<string, unknown> = {
      receiptId: r.id,
      uploadedAt: r.uploadedAt,
      contentType: asset?.contentType ?? null,
      sizeBytes: asset?.sizeBytes ?? null,
      assetUrlKind: asset?.url ? (/^https?:\/\//i.test(asset.url) ? "remote (blob)" : "local path") : "missing asset row",
    };

    if (!asset) {
      entry.error = "No matching row in `assets` for this receipt's assetId — the file record itself is gone.";
      results.push(entry);
      continue;
    }

    const readStart = Date.now();
    let buffer;
    try {
      buffer = await withTimeout(readAssetBuffer(asset.url), 10_000, "readAssetBuffer");
      entry.readAssetMs = Date.now() - readStart;
      entry.readAssetOk = true;
    } catch (err) {
      entry.readAssetMs = Date.now() - readStart;
      entry.readAssetOk = false;
      entry.error = err instanceof Error ? err.message : String(err);
      results.push(entry);
      continue;
    }

    const isPdf = asset.contentType === "application/pdf";
    const extractStart = Date.now();
    try {
      const result = isPdf
        ? await withTimeout(extractPdfText(buffer), 15_000, "extractPdfText")
        : await withTimeout(runOcr(buffer), 25_000, "runOcr");
      entry.extractMs = Date.now() - extractStart;
      if ("error" in result) {
        entry.extractOk = false;
        entry.extractError = result.error;
      } else {
        entry.extractOk = true;
        entry.textLength = result.text.length;
        entry.textSnippet = result.text.slice(0, 200);
      }
    } catch (err) {
      entry.extractMs = Date.now() - extractStart;
      entry.extractOk = false;
      entry.error = err instanceof Error ? err.message : String(err);
    }

    results.push(entry);
  }

  return Response.json(
    {
      ok: true,
      blobConfigured: !!process.env.BLOB_READ_WRITE_TOKEN,
      stuckCount: stuck.length,
      results,
    },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
