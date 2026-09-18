import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // tesseract.js spawns a real Node worker_threads worker pointing at a
  // file inside its own package on disk. Bundling it (the Next.js default)
  // rewrites that path into something that doesn't exist at runtime,
  // breaking OCR with "Cannot find module .../worker-script/node/index.js".
  // This tells Next.js to require tesseract.js directly from node_modules
  // at runtime instead of bundling it — the standard fix for packages that
  // do their own dynamic requires or worker spawning.
  serverExternalPackages: ["tesseract.js"],
};

export default nextConfig;
