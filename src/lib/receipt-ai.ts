import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Structured receipt reading via Claude, replacing the previous two-stage
// pipeline (tesseract.js OCR -> regex heuristic to guess which lines were
// prices). That pipeline's real-world accuracy was poor — thermal-printer
// fonts, skewed phone photos, and creases are exactly what generic OCR
// engines struggle with, and no regex can recover items an OCR pass never
// read correctly in the first place. A multimodal model reading the
// receipt directly and returning the items as structured JSON sidesteps
// both weak points at once.
//
// PDFs are sent to Claude as a native document block rather than run
// through pdfjs-dist's embedded-text-layer extraction (the old approach,
// which came back empty on a scanned PDF with no text layer — a receipt
// forwarded as a photo saved to PDF, essentially). Claude reads PDF pages
// visually too, so this one path now covers both real text-layer PDFs and
// scanned ones.

const MODEL = "claude-sonnet-5";
const REQUEST_TIMEOUT_MS = 30_000;

let cachedClient: Anthropic | null | undefined;
function getClient(): Anthropic | null {
  if (cachedClient !== undefined) return cachedClient;
  cachedClient = process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: REQUEST_TIMEOUT_MS })
    : null;
  return cachedClient;
}

export type ReceiptItem = { description: string; amount: number };
export type ReceiptExtraction = { vendor: string | null; items: ReceiptItem[] };

const PROMPT = `You are reading a store receipt image or PDF to log its purchased line items for a home-renovation expense tracker.

Reply with ONLY a JSON object — no markdown fences, no other text — in exactly this shape:
{"vendor": string | null, "items": [{"description": string, "amount": number}]}

Rules:
- One entry per purchased item, using the receipt's own wording for description (cleaned up — not the raw line, not an item code by itself).
- "amount" is that item's price as a plain positive number, no currency symbol.
- Do NOT include subtotal, tax, total, discount, payment/card, loyalty, or store-credit lines as items.
- "vendor" is the store or company name if it's visible on the receipt, otherwise null.
- If you can't confidently read any purchased items, return {"vendor": null, "items": []} rather than guessing.`;

const IMAGE_MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type ImageMediaType = (typeof IMAGE_MEDIA_TYPES)[number];

function toImageMediaType(contentType: string): ImageMediaType {
  const normalized = contentType === "image/jpg" ? "image/jpeg" : contentType;
  return (IMAGE_MEDIA_TYPES as readonly string[]).includes(normalized) ? (normalized as ImageMediaType) : "image/jpeg";
}

function parseExtractionResponse(text: string): ReceiptExtraction {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const raw = JSON.parse(cleaned) as { vendor?: unknown; items?: unknown };

  const vendor = typeof raw.vendor === "string" && raw.vendor.trim() ? raw.vendor.trim() : null;
  const itemsIn = Array.isArray(raw.items) ? raw.items : [];
  const items: ReceiptItem[] = [];
  for (const it of itemsIn) {
    const candidate = it as { description?: unknown; amount?: unknown };
    const description = typeof candidate.description === "string" ? candidate.description.trim() : "";
    const amount = Number(candidate.amount);
    if (description && Number.isFinite(amount) && amount > 0) {
      items.push({ description, amount });
    }
  }
  return { vendor, items };
}

export async function extractReceipt(
  fileBuffer: Buffer,
  contentType: string
): Promise<{ extraction: ReceiptExtraction; rawText: string } | { error: string }> {
  const anthropic = getClient();
  if (!anthropic) {
    return { error: "No ANTHROPIC_API_KEY configured on the server — add items by hand below." };
  }

  const isPdf = contentType === "application/pdf";
  const fileBlock = isPdf
    ? ({
        type: "document" as const,
        source: { type: "base64" as const, media_type: "application/pdf" as const, data: fileBuffer.toString("base64") },
      })
    : ({
        type: "image" as const,
        source: { type: "base64" as const, media_type: toImageMediaType(contentType), data: fileBuffer.toString("base64") },
      });

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: [fileBlock, { type: "text", text: PROMPT }] }],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    const rawText = textBlock && "text" in textBlock ? textBlock.text : "";
    const extraction = parseExtractionResponse(rawText);
    return { extraction, rawText };
  } catch (err) {
    console.error("Claude receipt extraction failed", err);
    return {
      error: isPdf
        ? "Couldn't read this PDF automatically — add items by hand below."
        : "Couldn't read this receipt automatically — add items by hand below.",
    };
  }
}
