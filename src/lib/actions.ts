"use server";

// Mutation actions. Names and behavior mirror the prototype's CRUD functions
// 1:1 (addHouse, updateDetail, deleteRoom, etc. — see PLAN.md's "App
// architecture" section) so the mapping stays traceable. The prototype had
// to hand-roll a per-document write queue (writeQueues in the prototype) to
// route around its store's lack of transactions; here, the cascading
// deletes that needed that care (deleteRoom moving details up, deleteHouse
// cascading through rooms and details) are real Postgres transactions
// instead — atomic by construction, not by careful sequencing.

import { db } from "@/db";
import {
  houses,
  rooms,
  details,
  checklistItems,
  materialItems,
  lineItems,
  inboxItems,
  assets,
  boardImages,
  paletteSwatches,
  progressPhotos,
  receipts,
  receiptLineItems,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { saveAsset, saveAssetBuffer, readAssetBuffer } from "./storage";
import { runOcr, extractPdfText, parseReceiptLines } from "./ocr";
import crypto from "node:crypto";

function revalidateEverything() {
  // Personal-scale app, cheap to over-invalidate rather than track exactly
  // which paths a given mutation could affect (a moved Detail touches two
  // houses' rollups, a filed inbox item touches the inbox count badge, etc).
  revalidatePath("/houses");
  revalidatePath("/inbox");
  revalidatePath("/horizon");
  revalidatePath("/overview");
  revalidatePath("/detail/[id]", "page");
}

// ---------- Houses ----------

export async function addHouse(name: string, address: string) {
  if (!name.trim()) return;
  const [row] = await db
    .insert(houses)
    .values({ name: name.trim(), address: address.trim() || null })
    .returning();
  revalidateEverything();
  return row;
}

export async function updateHouse(id: string, patch: Partial<{ name: string; address: string | null }>) {
  await db.update(houses).set(patch).where(eq(houses.id, id));
  revalidateEverything();
}

export async function deleteHouse(id: string) {
  await db.transaction(async (tx) => {
    const houseDetails = await tx.select().from(details).where(eq(details.houseId, id));
    for (const d of houseDetails) {
      await tx.delete(materialItems).where(eq(materialItems.detailId, d.id));
      await tx.delete(lineItems).where(eq(lineItems.detailId, d.id));
      await tx.delete(checklistItems).where(eq(checklistItems.detailId, d.id));
      await tx.update(inboxItems).set({ filedTo: null }).where(eq(inboxItems.filedTo, d.id));
      await tx.delete(details).where(eq(details.id, d.id));
    }
    await tx.delete(rooms).where(eq(rooms.houseId, id));
    await tx.delete(houses).where(eq(houses.id, id));
  });
  revalidateEverything();
}

// ---------- Rooms ----------

export async function addRoom(houseId: string, name: string) {
  if (!name.trim()) return;
  await db.insert(rooms).values({ houseId, name: name.trim() });
  revalidateEverything();
}

export async function updateRoom(id: string, patch: Partial<{ name: string }>) {
  await db.update(rooms).set(patch).where(eq(rooms.id, id));
  revalidateEverything();
}

export async function deleteRoom(id: string) {
  await db.transaction(async (tx) => {
    await tx.update(details).set({ roomId: null }).where(eq(details.roomId, id));
    await tx.delete(rooms).where(eq(rooms.id, id));
  });
  revalidateEverything();
}

// ---------- Details ----------

export async function addDetail(houseId: string, roomId: string | null, name: string) {
  if (!name.trim()) return;
  const [row] = await db
    .insert(details)
    .values({ houseId, roomId: roomId || null, name: name.trim(), status: "not_started" })
    .returning();
  revalidateEverything();
  return row;
}

export async function updateDetail(
  id: string,
  patch: Partial<{
    name: string;
    status: string;
    houseId: string;
    roomId: string | null;
    timeframeGranularity: string | null;
    timeframeValue: string | null;
    scratchpad: string | null;
    estimatedSpend: string | null;
    pinterestBoardUrl: string | null;
    notes: string | null;
  }>
) {
  await db.update(details).set(patch).where(eq(details.id, id));
  revalidateEverything();
}

export async function deleteDetail(id: string) {
  await db.transaction(async (tx) => {
    await tx.delete(materialItems).where(eq(materialItems.detailId, id));
    await tx.delete(lineItems).where(eq(lineItems.detailId, id));
    await tx.delete(checklistItems).where(eq(checklistItems.detailId, id));
    await tx.update(inboxItems).set({ filedTo: null }).where(eq(inboxItems.filedTo, id));
    await tx.delete(details).where(eq(details.id, id));
  });
  revalidateEverything();
}

// ---------- Checklist ----------

export async function addChecklistItem(detailId: string, description: string) {
  if (!description.trim()) return;
  await db.insert(checklistItems).values({ detailId, description: description.trim() });
  revalidateEverything();
}

export async function toggleChecklistItem(id: string, done: boolean) {
  await db.update(checklistItems).set({ done }).where(eq(checklistItems.id, id));
  revalidateEverything();
}

export async function updateChecklistItem(id: string, patch: Partial<{ description: string }>) {
  await db.update(checklistItems).set(patch).where(eq(checklistItems.id, id));
  revalidateEverything();
}

export async function deleteChecklistItem(id: string) {
  await db.delete(checklistItems).where(eq(checklistItems.id, id));
  revalidateEverything();
}

// ---------- Materials ----------

export async function addMaterial(detailId: string, description: string, qty: string, unitCost: string) {
  if (!description.trim()) return;
  await db.insert(materialItems).values({
    detailId,
    description: description.trim(),
    roughQuantity: qty || "1",
    roughUnitCost: unitCost || "0",
    status: "idea",
  });
  revalidateEverything();
}

export async function updateMaterial(
  id: string,
  patch: Partial<{ description: string; roughQuantity: string; roughUnitCost: string; status: string }>
) {
  await db.update(materialItems).set(patch).where(eq(materialItems.id, id));
  revalidateEverything();
}

export async function deleteMaterial(id: string) {
  await db.delete(materialItems).where(eq(materialItems.id, id));
  revalidateEverything();
}

// ---------- Line items (actual spend) ----------

export async function addLineItem(
  detailId: string,
  description: string,
  cost: string,
  vendor: string,
  date: string
) {
  if (!description.trim()) return;
  await db.insert(lineItems).values({
    detailId,
    description: description.trim(),
    cost: cost || "0",
    vendor: vendor.trim() || null,
    date: date || new Date().toISOString().slice(0, 10),
  });
  revalidateEverything();
}

export async function updateLineItem(
  id: string,
  patch: Partial<{ description: string; cost: string; vendor: string | null; date: string }>
) {
  await db.update(lineItems).set(patch).where(eq(lineItems.id, id));
  revalidateEverything();
}

export async function deleteLineItem(id: string) {
  await db.delete(lineItems).where(eq(lineItems.id, id));
  revalidateEverything();
}

// ---------- Inbox ----------

export async function addInboxItem(formData: FormData) {
  const text = String(formData.get("text") || "").trim();
  const file = formData.get("file") as File | null;

  let assetId: string | null = null;
  if (file && file.size > 0) {
    const saved = await saveAsset(file);
    const [row] = await db.insert(assets).values(saved).returning();
    assetId = row.id;
  }
  if (!text && !assetId) return;

  await db.insert(inboxItems).values({
    type: assetId ? "image" : "note",
    text,
    assetId,
    source: "manual",
  });
  revalidateEverything();
}

export async function fileInboxItem(id: string, detailId: string) {
  await db.update(inboxItems).set({ filedTo: detailId }).where(eq(inboxItems.id, id));
  revalidateEverything();
}

export async function discardInboxItem(id: string) {
  await db.delete(inboxItems).where(eq(inboxItems.id, id));
  revalidateEverything();
}

// File an inbox item into a brand-new House/Room/Detail created on the spot —
// the prototype's "+ or create a new detail for this" inline flow. Reuses
// an existing house/room by name if one already matches (case-insensitive),
// otherwise creates it, exactly like typing into the prototype's
// `list="houseList"` datalist-backed input.
export async function fileInboxItemToNew(
  inboxItemId: string,
  houseName: string,
  roomName: string,
  detailName: string
) {
  if (!houseName.trim() || !detailName.trim()) return;

  await db.transaction(async (tx) => {
    let house = (await tx.select().from(houses)).find(
      (h) => h.name.toLowerCase() === houseName.trim().toLowerCase()
    );
    if (!house) {
      [house] = await tx.insert(houses).values({ name: houseName.trim() }).returning();
    }

    let roomId: string | null = null;
    if (roomName.trim()) {
      const existingRoom = (await tx.select().from(rooms).where(eq(rooms.houseId, house.id))).find(
        (r) => r.name.toLowerCase() === roomName.trim().toLowerCase()
      );
      if (existingRoom) {
        roomId = existingRoom.id;
      } else {
        const [newRoom] = await tx.insert(rooms).values({ houseId: house.id, name: roomName.trim() }).returning();
        roomId = newRoom.id;
      }
    }

    const [detail] = await tx
      .insert(details)
      .values({ houseId: house.id, roomId, name: detailName.trim(), status: "not_started" })
      .returning();

    await tx.update(inboxItems).set({ filedTo: detail.id }).where(eq(inboxItems.id, inboxItemId));
  });
  revalidateEverything();
}


// ---------- Mood board / Reference collection (Phase 3) ----------
// Mood board and Reference collection share this same image-collection
// mechanic (upload or paste an image URL) but are kept as separate
// collections (boardType) since they answer different questions — "what
// should this look like" vs. "how does this go together" — per the
// brief's own reasoning (section 7).

export async function addBoardImage(formData: FormData) {
  const detailId = String(formData.get("detailId") || "");
  const boardType = String(formData.get("boardType") || "");
  const sourceUrl = String(formData.get("sourceUrl") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const file = formData.get("file") as File | null;

  let assetId: string | null = null;
  if (file && file.size > 0) {
    const saved = await saveAsset(file);
    const [row] = await db.insert(assets).values(saved).returning();
    assetId = row.id;
  }
  if (!assetId && !sourceUrl) return;

  await db.insert(boardImages).values({ detailId, boardType, assetId, sourceUrl: sourceUrl || null, notes });
  revalidateEverything();
}

export async function updateBoardImage(
  id: string,
  patch: Partial<{ notes: string; boardType: string }>
) {
  await db.update(boardImages).set(patch).where(eq(boardImages.id, id));
  revalidateEverything();
}

export async function deleteBoardImage(id: string) {
  await db.delete(boardImages).where(eq(boardImages.id, id));
  revalidateEverything();
}

// ---------- Color palette (Phase 3) ----------

export async function addSwatch(detailId: string, hex: string, label: string) {
  await db.insert(paletteSwatches).values({ detailId, hex: hex || "#9D8B5E", label: label.trim() });
  revalidateEverything();
}

export async function updateSwatch(id: string, patch: Partial<{ hex: string; label: string }>) {
  await db.update(paletteSwatches).set(patch).where(eq(paletteSwatches.id, id));
  revalidateEverything();
}

export async function deleteSwatch(id: string) {
  await db.delete(paletteSwatches).where(eq(paletteSwatches.id, id));
  revalidateEverything();
}

// ---------- Progress photos (Phase 3) ----------

export async function addProgressPhoto(formData: FormData) {
  const detailId = String(formData.get("detailId") || "");
  const phase = String(formData.get("phase") || "");
  const notes = String(formData.get("notes") || "").trim();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;

  const saved = await saveAsset(file);
  const [assetRow] = await db.insert(assets).values(saved).returning();
  await db.insert(progressPhotos).values({ detailId, phase, assetId: assetRow.id, notes });
  revalidateEverything();
}

export async function deleteProgressPhoto(id: string) {
  await db.delete(progressPhotos).where(eq(progressPhotos.id, id));
  revalidateEverything();
}

// ---------- Receipts + OCR (Phase 4) ----------
// Upload -> hash -> dedupe warning -> server-side OCR -> pending line items
// -> assign/dismiss -> auto-flip to logged, per PLAN.md's Phase 4 section.
// Receipts are deliberately never run through compressImage() client-side
// (unlike every other photo upload in this app) — OCR needs the sharpest
// text it can get, and re-encoding a receipt photo at lower quality would
// work against that for no benefit (receipts are typically much smaller
// files than a full photo anyway).

function sha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function maybeMarkReceiptLogged(receiptId: string) {
  const items = await db.select().from(receiptLineItems).where(eq(receiptLineItems.receiptId, receiptId));
  if (items.length && items.every((i) => i.status !== "pending")) {
    await db.update(receipts).set({ status: "logged" }).where(eq(receipts.id, receiptId));
  }
}

async function extractAndStoreLineItems(receiptId: string, fileBuffer: Buffer, contentType: string) {
  await db.update(receipts).set({ status: "processing", ocrError: null }).where(eq(receipts.id, receiptId));

  const isPdf = contentType === "application/pdf";
  const result = isPdf ? await extractPdfText(fileBuffer) : await runOcr(fileBuffer);
  if ("error" in result) {
    await db.update(receipts).set({ status: "new", ocrError: result.error }).where(eq(receipts.id, receiptId));
    return;
  }

  const found = parseReceiptLines(result.text);

  // DEVIATION from the prototype: re-scanning there just appended newly
  // found items on top of whatever was already there, so clicking
  // "Re-scan" more than once would pile up duplicate pending items. This
  // clears out still-pending items first (leaving anything already
  // assigned or dismissed untouched — those represent a real decision
  // already made) before inserting the fresh batch.
  await db
    .delete(receiptLineItems)
    .where(and(eq(receiptLineItems.receiptId, receiptId), eq(receiptLineItems.status, "pending")));

  for (const item of found) {
    await db.insert(receiptLineItems).values({
      receiptId,
      description: item.description,
      amount: String(item.amount),
      status: "pending",
    });
  }

  await db
    .update(receipts)
    .set({
      status: "new",
      ocrText: result.text,
      ocrError: found.length
        ? null
        : isPdf
          ? "Read the PDF, but couldn't confidently pick out line items — this can happen if it's a scanned image with no real text layer. Add them by hand below."
          : "Scanned it, but couldn't confidently pick out line items — add them by hand below.",
    })
    .where(eq(receipts.id, receiptId));

  await maybeMarkReceiptLogged(receiptId);
}

export async function uploadReceipt(
  formData: FormData
): Promise<{ id: string } | { duplicate: true; uploadedAt: string | null } | { error: string }> {
  const file = formData.get("file") as File | null;
  const force = formData.get("force") === "true";
  if (!file || file.size === 0) return { error: "No file provided." };

  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = sha256(buffer);

  if (!force) {
    const [existing] = await db.select().from(receipts).where(eq(receipts.imageHash, hash)).limit(1);
    if (existing) {
      return { duplicate: true, uploadedAt: existing.uploadedAt?.toISOString() ?? null };
    }
  }

  const contentType = file.type || "image/jpeg";
  const saved = await saveAssetBuffer(buffer, file.name, contentType);
  const [assetRow] = await db.insert(assets).values(saved).returning();
  const [receiptRow] = await db
    .insert(receipts)
    .values({ assetId: assetRow.id, imageHash: hash, status: "new" })
    .returning();

  await extractAndStoreLineItems(receiptRow.id, buffer, contentType);
  revalidateEverything();
  return { id: receiptRow.id };
}

export async function rescanReceipt(receiptId: string) {
  const [receipt] = await db.select().from(receipts).where(eq(receipts.id, receiptId)).limit(1);
  if (!receipt) return;
  const [asset] = await db.select().from(assets).where(eq(assets.id, receipt.assetId)).limit(1);
  if (!asset) return;

  try {
    const buffer = await readAssetBuffer(asset.url);
    await extractAndStoreLineItems(receiptId, buffer, asset.contentType || "image/jpeg");
  } catch (err) {
    console.error("rescan failed to read asset", err);
    await db
      .update(receipts)
      .set({ status: "new", ocrError: "Couldn't re-read the receipt image — try uploading it again." })
      .where(eq(receipts.id, receiptId));
  }
  revalidateEverything();
}

export async function assignReceiptLineItem(itemId: string, detailId: string) {
  const [item] = await db.select().from(receiptLineItems).where(eq(receiptLineItems.id, itemId)).limit(1);
  if (!item) return;
  const [receipt] = await db.select().from(receipts).where(eq(receipts.id, item.receiptId)).limit(1);

  await db.insert(lineItems).values({
    detailId,
    description: item.description,
    cost: item.amount,
    vendor: receipt?.vendor || "",
    date: (receipt?.uploadedAt?.toISOString() ?? new Date().toISOString()).slice(0, 10),
    receiptAssetId: receipt?.assetId ?? null,
  });
  await db
    .update(receiptLineItems)
    .set({ status: "assigned", assignedDetailId: detailId })
    .where(eq(receiptLineItems.id, itemId));
  await maybeMarkReceiptLogged(item.receiptId);
  revalidateEverything();
}

// Editable regardless of status (pending, dismissed, or already assigned)
// — a typo caught after dismissing something, or before deciding where an
// item belongs, shouldn't be stuck. Note: editing an already-assigned
// item's description/amount here does NOT retroactively change the real
// LineItem it already created on a Detail's spend log — that's a separate,
// independently-editable record at that point, same as the rest of the
// app's pattern of editing spend directly on the Detail page.
export async function updateReceiptLineItem(
  itemId: string,
  patch: Partial<{ description: string; amount: string }>
) {
  await db.update(receiptLineItems).set(patch).where(eq(receiptLineItems.id, itemId));
  revalidateEverything();
}

export async function dismissReceiptLineItem(itemId: string) {
  const [item] = await db.select().from(receiptLineItems).where(eq(receiptLineItems.id, itemId)).limit(1);
  if (!item) return;
  await db.update(receiptLineItems).set({ status: "dismissed" }).where(eq(receiptLineItems.id, itemId));
  await maybeMarkReceiptLogged(item.receiptId);
  revalidateEverything();
}

// Undo a dismiss without having to assign it right away — added alongside
// letting dismissed items still be assigned, so "I dismissed this by
// mistake" has a direct way back to pending, not just straight to a Detail.
export async function restoreReceiptLineItem(itemId: string) {
  const [item] = await db.select().from(receiptLineItems).where(eq(receiptLineItems.id, itemId)).limit(1);
  if (!item) return;
  await db.update(receiptLineItems).set({ status: "pending" }).where(eq(receiptLineItems.id, itemId));
  // A pending item means this receipt is no longer fully logged.
  await db.update(receipts).set({ status: "new" }).where(eq(receipts.id, item.receiptId));
  revalidateEverything();
}

export async function addManualReceiptItem(receiptId: string, description: string, amount: string) {
  if (!description.trim()) return;
  await db.insert(receiptLineItems).values({
    receiptId,
    description: description.trim(),
    amount: amount || "0",
    status: "pending",
  });
  // A new pending item means this receipt is no longer fully logged.
  await db.update(receipts).set({ status: "new" }).where(eq(receipts.id, receiptId));
  revalidateEverything();
}

export async function updateReceiptVendor(id: string, vendor: string) {
  const trimmed = vendor.trim() || null;
  const [receipt] = await db.select().from(receipts).where(eq(receipts.id, id)).limit(1);
  if (!receipt) return;

  await db.update(receipts).set({ vendor: trimmed }).where(eq(receipts.id, id));

  // Backfill: any LineItem already created by assigning one of this
  // receipt's items (before the vendor was set, or if it's edited later)
  // should reflect the vendor too, not just assignments made from now on.
  // receiptAssetId is unique per receipt (each receipt gets its own
  // uploaded asset), so every LineItem carrying it necessarily came from
  // assigning an item off THIS receipt.
  await db.update(lineItems).set({ vendor: trimmed || "" }).where(eq(lineItems.receiptAssetId, receipt.assetId));

  revalidateEverything();
}

export async function deleteReceipt(id: string) {
  await db.delete(receiptLineItems).where(eq(receiptLineItems.receiptId, id));
  await db.delete(receipts).where(eq(receipts.id, id));
  revalidateEverything();
}
