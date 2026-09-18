import "server-only";
import { createWorker } from "tesseract.js";
// Legacy Node-compatible build — the "legacy" export exists specifically
// for environments without a DOM (browser canvas, web workers via
// `new Worker(url)`), which is exactly a Next.js server function.
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// Server-side OCR via tesseract.js — same free, open-source engine the
// prototype ran in the browser, just moved into a Node server function so
// it isn't dependent on a CDN load succeeding in whatever browser Leanne
// happens to be using, and so it can retry. Load-tested before building
// this feature (see PLAN.md's Phase 4 note): ~350ms warm / ~700ms cold for
// a full receipt-sized image on this machine, comfortably inside Vercel
// Hobby's function duration budget (60-300s) — not just assumed to fit.

export async function runOcr(imageBuffer: Buffer): Promise<{ text: string } | { error: string }> {
  let worker;
  try {
    worker = await createWorker("eng", 1, { cachePath: "/tmp/tesseract-cache" });
    const { data } = await worker.recognize(imageBuffer);
    return { text: data.text || "" };
  } catch (err) {
    console.error("OCR failed", err);
    return { error: "OCR couldn't run on this image — add items by hand below." };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // best effort cleanup, not worth failing the request over
      }
    }
  }
}

// PDF text extraction via pdfjs-dist directly, deliberately NOT the
// `pdf-parse` package — pdf-parse pulls in @napi-rs/canvas (a native
// binary) as a hard dependency even though we only need plain text
// extraction, which pdfjs-dist's getTextContent() does with zero native
// dependencies. This only reads a PDF's actual embedded text layer — a
// scanned PDF with no text layer (a photo saved as a PDF, essentially)
// will come back empty, same as any other OCR miss, and falls back to the
// same "add items by hand" path. Rasterizing pages to images and running
// them through tesseract was considered and skipped: it would need a
// canvas implementation too, reintroducing the exact native-dependency
// risk this avoids.
export async function extractPdfText(pdfBuffer: Buffer): Promise<{ text: string } | { error: string }> {
  try {
    const doc = await getDocument({ data: new Uint8Array(pdfBuffer), useSystemFonts: true }).promise;
    let fullText = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      // getTextContent returns individual text fragments with x/y
      // coordinates, not lines — group fragments that share a y position
      // (allowing for tiny rounding differences) back into lines so the
      // same line-based parseReceiptLines heuristic below still applies.
      const rows = new Map<number, string[]>();
      for (const item of content.items) {
        if (!("str" in item)) continue;
        const y = Math.round(item.transform[5]);
        if (!rows.has(y)) rows.set(y, []);
        rows.get(y)!.push(item.str);
      }
      const sortedYs = [...rows.keys()].sort((a, b) => b - a);
      for (const y of sortedYs) fullText += rows.get(y)!.join("") + "\n";
    }
    return { text: fullText };
  } catch (err) {
    console.error("PDF text extraction failed", err);
    return { error: "Couldn't read this PDF — add items by hand below." };
  }
}

// Heuristic line-item extraction, ported verbatim from the prototype's
// parseReceiptLines: looks for a trailing price on a line, skips
// subtotal/tax/card-number/etc lines. Same limitations as the prototype
// called out — imperfect, review what it finds, manual add-by-hand always
// available as a fallback.
const PRICE_RE = /(\d{1,4}\.\d{2})\s*$/;
const SKIP_WORDS_RE =
  /subtotal|^total|grand total|\btax\b|change due|cash|visa|mastercard|amex|discover|debit|credit|balance|tender|approved|auth\s*code|card\s*#|thank you|store\s*#|receipt\s*#/i;

export function parseReceiptLines(text: string): { description: string; amount: number }[] {
  const lines = (text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const items: { description: string; amount: number }[] = [];

  for (const line of lines) {
    if (SKIP_WORDS_RE.test(line)) continue;
    const m = line.match(PRICE_RE);
    if (!m) continue;
    const amount = parseFloat(m[1]);
    if (!(amount > 0 && amount < 5000)) continue;
    let description = line.slice(0, m.index).replace(/[-–—.\s]+$/, "").trim();
    if (!description || description.length < 2) description = "Item";
    items.push({ description, amount });
  }
  return items;
}
