import "server-only";
import path from "path";
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
//
// BUT: left at its defaults, tesseract.js still fetches the English
// language data (~3MB) from jsdelivr's CDN on every cold start — `/tmp` is
// wiped between Vercel invocations, so `cachePath` alone never gets a
// chance to help there. That network fetch was the actual cause of
// receipts getting stuck at "processing" forever in production: if it's
// slow or the container gets recycled mid-fetch, the whole function is
// killed from outside, so neither the try/catch below nor the "processing"
// status-reset in extractAndStoreLineItems ever runs. Fix: the exact same
// file tesseract.js would have downloaded is vendored at
// src/lib/tessdata/eng.traineddata.gz (see next.config.ts's
// outputFileTracingIncludes for why it survives the serverless bundle),
// and `langPath` points at it directly — a local file read, no network
// involved, so cold starts are no slower than warm ones.
const LANG_PATH = path.join(process.cwd(), "src/lib/tessdata");

// Belt-and-suspenders for the same failure mode: if recognize() ever does
// hang for some other reason, fail fast (well inside any serverless
// duration budget) and record a real ocrError instead of leaving the
// receipt stuck at "processing" with no way to tell what happened short of
// clicking Re-scan and hoping.
const OCR_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}

export async function runOcr(imageBuffer: Buffer): Promise<{ text: string } | { error: string }> {
  let worker;
  try {
    worker = await withTimeout(
      createWorker("eng", 1, { cachePath: "/tmp/tesseract-cache", langPath: LANG_PATH }),
      OCR_TIMEOUT_MS,
      "OCR worker startup"
    );
    const { data } = await withTimeout(worker.recognize(imageBuffer), OCR_TIMEOUT_MS, "OCR recognition");
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

// Two line-item extraction strategies, run together and merged, since real
// receipts come in two genuinely different shapes:
//
// 1. Classic single-line-per-item (a photographed thermal receipt):
//    "1x6x8 CEDAR BOARD       24.99" — description and price on one line.
//    This is the prototype's original parseReceiptLines heuristic, ported
//    verbatim: look for a trailing price, skip subtotal/tax/card lines.
//
// 2. Structured multi-line blocks (an emailed order-confirmation PDF, e.g.
//    a real Lowe's receipt tested against while building this): item name
//    and price can be 3-4 lines apart, e.g.
//      5/4-6-8 SMOOTH CEDAR KD D QTY
//      5
//      Item #: 430691 | Model #: 5/4X6X8 TOP CHOICE KD S4S
//      Unit Price: $18.88 | Subtotal: $94.40
//    Strategy 1 alone finds nothing here — the price-bearing line contains
//    the word "subtotal" and gets skipped outright, and every other line
//    in the block has no trailing price at all. Verified against a
//    reconstruction of a real receipt that came back completely empty
//    before this was added (0 of 4 real items, plus 2 false positives from
//    a "Payment $47.00" / "Card Transaction Amount $47.00" section that
//    strategy 1 alone had no way to distinguish from a purchased item).
//
// Both are best-effort heuristics, not a receipt parser — imperfect,
// review what's found, manual add-by-hand always available.

const PRICE_RE = /(\d{1,4}\.\d{2})\s*$/;
const SKIP_WORDS_RE =
  /subtotal|^total|grand total|\btax\b|change due|cash|visa|mastercard|amex|discover|debit|credit|balance|tender|approved|auth\s*code|card\s*#|thank you|store\s*#|receipt\s*#|\bpayment\b|card transaction/i;

function parseSingleLineItems(lines: string[]): { description: string; amount: number }[] {
  const items: { description: string; amount: number }[] = [];
  for (const line of lines) {
    if (SKIP_WORDS_RE.test(line)) continue;
    const m = line.match(PRICE_RE);
    if (!m) continue;
    const amount = parseFloat(m[1]);
    if (!(amount > 0 && amount < 5000)) continue;
    let description = line.slice(0, m.index).replace(/[-–—.:$\s]+$/, "").trim();
    if (!description || description.length < 2) description = "Item";
    items.push({ description, amount });
  }
  return items;
}

// A per-item "Subtotal:" (colon required) is the anchor — deliberately
// distinct from a receipt-level "Subtotal $188.16" or "Subtotal $ 188.21"
// (no colon in the real example this was built against), which stay
// correctly excluded. From that line, walk backward past the "Item
// #:"/"Model #:" line and the bare quantity-number line to find the item
// name line, stripping a trailing "QTY" layout artifact if present.
const ITEM_SUBTOTAL_RE = /subtotal\s*:\s*\$?([\d,]+\.\d{2})/i;
const SKIP_FOR_BLOCK_NAME_RE = /^item\s*#|^qty$|^\d+$/i;

function parseStructuredBlocks(lines: string[]): { description: string; amount: number }[] {
  const items: { description: string; amount: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(ITEM_SUBTOTAL_RE);
    if (!m) continue;
    const amount = parseFloat(m[1].replace(/,/g, ""));
    if (!(amount > 0 && amount < 5000)) continue;

    let description = "Item";
    for (let j = i - 1; j >= Math.max(0, i - 4); j--) {
      const candidate = lines[j].trim();
      if (!candidate || SKIP_FOR_BLOCK_NAME_RE.test(candidate)) continue;
      description = candidate.replace(/\bqty\b\s*$/i, "").trim();
      break;
    }
    if (description.length < 2) description = "Item";
    items.push({ description, amount });
  }
  return items;
}

export function parseReceiptLines(text: string): { description: string; amount: number }[] {
  const lines = (text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return [...parseStructuredBlocks(lines), ...parseSingleLineItems(lines)];
}
