import { db } from "@/db";
import { assets } from "@/db/schema";
import { eq } from "drizzle-orm";

// Resolves a stable /asset/<id> reference to wherever the file actually
// lives (a Vercel Blob URL in production, or /api/uploads/<name> in local
// dev — see src/lib/storage.ts). Mirrors the prototype's /_blob/<assetId>
// convention so every *AssetId field in the schema has one consistent way
// to render as an <img src>.

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [asset] = await db.select().from(assets).where(eq(assets.id, id)).limit(1);
  if (!asset) return new Response("Not found", { status: 404 });
  const url = asset.url.startsWith("http") ? asset.url : new URL(asset.url, _req.url).toString();
  return Response.redirect(url, 307);
}
