import { readFile } from "node:fs/promises";
import path from "node:path";

// Serves files saved by the local-dev fallback in src/lib/storage.ts. Only
// reachable in development (no BLOB_READ_WRITE_TOKEN => nothing gets saved
// here in production). Sits behind the same passphrase gate as everything
// else (src/proxy.ts's matcher covers /api routes too).

// Must match src/lib/storage.ts's LOCAL_UPLOAD_DIR exactly — same env var,
// same default.
// turbopackIgnore: see the matching comment in src/lib/storage.ts — this
// non-literal path otherwise fails the production build on Vercel.
const LOCAL_UPLOAD_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOAD_DIR || ".uploads");

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const filename = segments.join("/");
  if (filename.includes("..") || filename.includes("/")) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const data = await readFile(path.join(/* turbopackIgnore: true */ LOCAL_UPLOAD_DIR, filename));
    return new Response(new Uint8Array(data), {
      headers: { "Cache-Control": "private, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
