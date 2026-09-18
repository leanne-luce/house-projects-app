import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Both tesseract.js and pdfjs-dist spawn a real worker pointing at a file
  // inside their own package on disk (worker_threads for tesseract.js, its
  // own pdf.worker.mjs for pdfjs-dist). Bundling either (the Next.js
  // default) rewrites that path into something that doesn't exist at
  // runtime — "Cannot find module .../worker-script/node/index.js" for
  // tesseract.js, "Setting up fake worker failed" for pdfjs-dist. This
  // tells Next.js to require both directly from node_modules at runtime
  // instead of bundling them — the standard fix for packages that do their
  // own dynamic requires or worker spawning.
  serverExternalPackages: ["tesseract.js", "pdfjs-dist"],
};

export default nextConfig;
