import "server-only";
import { createWorker } from "tesseract.js";

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
