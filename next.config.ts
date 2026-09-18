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

  // Every upload in this app (receipts, mood board/reference images,
  // progress photos and video) goes through a Server Action, and Next.js
  // caps a Server Action's request body at 1MB by default. Mood board etc.
  // uploads stay under that after client-side compression, but receipts
  // are deliberately NOT compressed (to protect OCR text quality) and a
  // real phone photo can easily be 3-8MB — meaning receipt uploads were
  // likely already silently failing past 1MB before this was raised, and
  // video (added on request, not compressed either) would hit it almost
  // immediately. Note this is Next.js's own limit, not Vercel's — the
  // platform itself may impose a separate ceiling on serverless function
  // request bodies that this doesn't override, and that hasn't been
  // verified against a real Vercel deployment (only local dev, where no
  // such platform limit exists). If very large uploads still fail once
  // deployed, the fix is a client-side direct-to-Blob upload instead of
  // routing bytes through a function at all.
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
