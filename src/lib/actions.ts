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
  boardImageDetails,
  boardImageRooms,
  paletteSwatches,
  progressPhotos,
  progressPhotoDetails,
  receipts,
  receiptLineItems,
  ROOM_GROUP_VALUES,
  housePaletteColors,
  PAINT_FINISH_VALUES,
  detailPaletteColors,
} from "@/db/schema";

import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { saveAsset, saveAssetBuffer, readAssetBuffer } from "./storage";
import { runOcr, extractPdfText, parseReceiptLines } from "./ocr";
import { sanitizeProductUrl, retailerNameFromUrl } from "./product-link";
import crypto from "node:crypto";

type RoomGroup = (typeof ROOM_GROUP_VALUES)[number];
type PaintFinish = (typeof PAINT_FINISH_VALUES)[number];
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

function revalidateEverything() {
  // Personal-scale app, cheap to over-invalidate rather than track exactly
  // which paths a given mutation could affect (a moved Detail touches two
  // houses' rollups, etc).
  revalidatePath("/houses");
  revalidatePath("/horizon");
  revalidatePath("/overview");
  revalidatePath("/lookbook");
  revalidatePath("/receipts");
  revalidatePath("/furniture");
  revalidatePath("/detail/[id]", "page");
}

// Deletes/detaches everything hanging off a Detail before the Detail row
// itself is deleted. materialItems/lineItems/checklistItems have no other
// consumer once the Detail is gone, so they're deleted outright; the FK
// tables that could still matter elsewhere (a receipt line item's
// assignment, an inbox item's filing) are nulled out instead of deleted, the
// same "detach, don't destroy" pattern already used for `details.roomId` in
// deleteRoom. Shared between deleteDetail and deleteHouse's per-detail loop
// so the two never drift out of sync on what needs cleaning up.
async function cleanupDetailChildren(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], detailId: string) {
  // lineItems before materialItems — a line item can now reference a
  // material (materialId), so it has to go first or the FK blocks the
  // material's delete.
  await tx.delete(lineItems).where(eq(lineItems.detailId, detailId));
  await tx.delete(materialItems).where(eq(materialItems.detailId, detailId));
  await tx.delete(checklistItems).where(eq(checklistItems.detailId, detailId));
  await tx.delete(paletteSwatches).where(eq(paletteSwatches.detailId, detailId));
  await tx.delete(detailPaletteColors).where(eq(detailPaletteColors.detailId, detailId));

  // A photo "owned" by this detail (progressPhotos.detailId) may also be
  // linked to OTHER details via progressPhotoDetails (that's the whole
  // point of letting one photo cover several details) — every link row
  // touching one of these photos has to go before the photo rows
  // themselves can be deleted, not just the links for this detail.
  const ownedPhotos = await tx
    .select({ id: progressPhotos.id })
    .from(progressPhotos)
    .where(eq(progressPhotos.detailId, detailId));
  if (ownedPhotos.length) {
    await tx.delete(progressPhotoDetails).where(
      inArray(
        progressPhotoDetails.progressPhotoId,
        ownedPhotos.map((p) => p.id)
      )
    );
  }
  // This detail's link to any OTHER photo it didn't own (e.g. a room-level
  // or another detail's photo this one was also tagged onto) — the photo
  // itself survives, it just loses this one assignment.
  await tx.delete(progressPhotoDetails).where(eq(progressPhotoDetails.detailId, detailId));
  await tx.delete(progressPhotos).where(eq(progressPhotos.detailId, detailId));

  // Unlike progress photos, an inspiration image is house-owned, not
  // detail-owned — deleting a detail just untags it (removing the join
  // row), the image itself survives in the house's Lookbook bucket. Also
  // clear the legacy provenance column on any row that still points here,
  // since it carries a real FK.
  await tx.delete(boardImageDetails).where(eq(boardImageDetails.detailId, detailId));
  await tx.update(boardImages).set({ detailId: null }).where(eq(boardImages.detailId, detailId));

  await tx
    .update(receiptLineItems)
    .set({ assignedDetailId: null })
    .where(eq(receiptLineItems.assignedDetailId, detailId));
  await tx.update(inboxItems).set({ filedTo: null }).where(eq(inboxItems.filedTo, detailId));
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

export async function updateHouse(
  id: string,
  patch: Partial<{ name: string; address: string | null; purchasePrice: string | null; downPayment: string | null }>
) {
  await db.update(houses).set(patch).where(eq(houses.id, id));
  revalidateEverything();
}

export async function deleteHouse(id: string) {
  await db.transaction(async (tx) => {
    const houseDetails = await tx.select().from(details).where(eq(details.houseId, id));
    for (const d of houseDetails) {
      await cleanupDetailChildren(tx, d.id);
      await tx.delete(details).where(eq(details.id, d.id));
    }
    const houseRooms = await tx.select({ id: rooms.id }).from(rooms).where(eq(rooms.houseId, id));
    if (houseRooms.length) {
      await tx.delete(boardImageRooms).where(
        inArray(
          boardImageRooms.roomId,
          houseRooms.map((r) => r.id)
        )
      );
    }
    await tx.delete(rooms).where(eq(rooms.houseId, id));
    await tx.delete(housePaletteColors).where(eq(housePaletteColors.houseId, id));

    // Any inspiration image this house owns — assigned or not — goes with
    // it; every detail/room it could have been tagged to is already gone.
    const houseImages = await tx.select({ id: boardImages.id }).from(boardImages).where(eq(boardImages.houseId, id));
    if (houseImages.length) {
      const imageIds = houseImages.map((img) => img.id);
      await tx.delete(boardImageDetails).where(inArray(boardImageDetails.boardImageId, imageIds));
      await tx.delete(boardImageRooms).where(inArray(boardImageRooms.boardImageId, imageIds));
      await tx.delete(boardImages).where(eq(boardImages.houseId, id));
    }

    await tx.delete(houses).where(eq(houses.id, id));
  });
  revalidateEverything();
}

// ---------- Rooms ----------

export async function addRoom(houseId: string, name: string, group?: RoomGroup) {
  if (!name.trim()) return;
  if (group && !ROOM_GROUP_VALUES.includes(group)) throw new Error(`Invalid room group: ${group}`);
  await db.insert(rooms).values({ houseId, name: name.trim(), group: group || "interior" });
  revalidateEverything();
}

export async function updateRoom(id: string, patch: Partial<{ name: string; group: RoomGroup }>) {
  if (patch.group && !ROOM_GROUP_VALUES.includes(patch.group)) {
    throw new Error(`Invalid room group: ${patch.group}`);
  }
  await db.update(rooms).set(patch).where(eq(rooms.id, id));
  revalidateEverything();
}

export async function deleteRoom(id: string) {
  await db.transaction(async (tx) => {
    await tx.update(details).set({ roomId: null }).where(eq(details.roomId, id));
    // Same "promote, don't destroy" treatment for a room-level photo — it
    // becomes unrouted rather than vanishing (it may still be linked to a
    // detail directly, which is unaffected by this).
    await tx.update(progressPhotos).set({ roomId: null }).where(eq(progressPhotos.roomId, id));
    // Same for an inspiration image tagged to this room directly — the tag
    // goes, the image survives at the house level.
    await tx.delete(boardImageRooms).where(eq(boardImageRooms.roomId, id));
    await tx.delete(rooms).where(eq(rooms.id, id));
  });
  revalidateEverything();
}

// ---------- House palette colors ----------

type PaletteColorInput = {
  name: string;
  hex?: string;
  brand?: string | null;
  colorCode?: string | null;
  finish?: PaintFinish;
  whereUsed?: string | null;
  notes?: string | null;
};

function normalizeHex(hex: string | undefined): string | undefined {
  if (!hex) return undefined;
  let v = hex.trim();
  if (!v.startsWith("#")) v = `#${v}`;
  // Expand shorthand #rgb -> #rrggbb so pasted/typed shorthand hex still validates.
  if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
    v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  }
  return v;
}

function validatePaletteColorInput(input: PaletteColorInput, hex: string | undefined) {
  if (!input.name.trim()) throw new Error("A color needs a name.");
  if (hex && !HEX_RE.test(hex)) throw new Error(`Invalid hex color: ${input.hex}`);
  if (input.finish && !PAINT_FINISH_VALUES.includes(input.finish)) {
    throw new Error(`Invalid finish: ${input.finish}`);
  }
}

export async function addPaletteColor(houseId: string, input: PaletteColorInput) {
  const hex = normalizeHex(input.hex);
  validatePaletteColorInput(input, hex);
  const [row] = await db
    .insert(housePaletteColors)
    .values({
      houseId,
      name: input.name.trim(),
      hex: hex || "#9D8B5E",
      brand: input.brand?.trim() || null,
      colorCode: input.colorCode?.trim() || null,
      finish: input.finish || "flat",
      whereUsed: input.whereUsed?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .returning();
  revalidateEverything();
  return row;
}

export async function updatePaletteColor(id: string, patch: Partial<PaletteColorInput>) {
  const hex = "hex" in patch ? normalizeHex(patch.hex) : undefined;
  if (patch.name !== undefined || hex !== undefined || patch.finish !== undefined) {
    validatePaletteColorInput({ name: patch.name ?? "placeholder", ...patch }, hex);
  }
  await db
    .update(housePaletteColors)
    .set({
      ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
      ...(hex !== undefined ? { hex } : {}),
      ...(patch.brand !== undefined ? { brand: patch.brand?.trim() || null } : {}),
      ...(patch.colorCode !== undefined ? { colorCode: patch.colorCode?.trim() || null } : {}),
      ...(patch.finish !== undefined ? { finish: patch.finish } : {}),
      ...(patch.whereUsed !== undefined ? { whereUsed: patch.whereUsed?.trim() || null } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes?.trim() || null } : {}),
    })
    .where(eq(housePaletteColors.id, id));
  revalidateEverything();
}

export async function deletePaletteColor(id: string) {
  await db.transaction(async (tx) => {
    await tx.delete(detailPaletteColors).where(eq(detailPaletteColors.paletteColorId, id));
    await tx.delete(housePaletteColors).where(eq(housePaletteColors.id, id));
  });
  revalidateEverything();
}

// ---------- Detail <-> palette color links ----------

export async function linkPaletteColorToDetail(detailId: string, paletteColorId: string, role?: string | null) {
  const [detail] = await db.select({ houseId: details.houseId }).from(details).where(eq(details.id, detailId));
  const [color] = await db
    .select({ houseId: housePaletteColors.houseId })
    .from(housePaletteColors)
    .where(eq(housePaletteColors.id, paletteColorId));
  if (!detail || !color || detail.houseId !== color.houseId) {
    throw new Error("That color doesn't belong to this detail's house.");
  }
  const [row] = await db
    .insert(detailPaletteColors)
    .values({ detailId, paletteColorId, role: role?.trim() || null })
    .returning();
  revalidateEverything();
  return row;
}

export async function updateDetailPaletteColorRole(linkId: string, role: string | null) {
  await db
    .update(detailPaletteColors)
    .set({ role: role?.trim() || null })
    .where(eq(detailPaletteColors.id, linkId));
  revalidateEverything();
}

export async function unlinkPaletteColorFromDetail(linkId: string) {
  await db.delete(detailPaletteColors).where(eq(detailPaletteColors.id, linkId));
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
    isFurniture: boolean;
    targetDate: string | null;
  }>
) {
  await db.update(details).set(patch).where(eq(details.id, id));
  revalidateEverything();
}

export async function deleteDetail(id: string) {
  await db.transaction(async (tx) => {
    await cleanupDetailChildren(tx, id);
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

export async function updateChecklistItem(
  id: string,
  patch: Partial<{ description: string; dueDate: string | null; note: string | null }>
) {
  await db.update(checklistItems).set(patch).where(eq(checklistItems.id, id));
  revalidateEverything();
}

export async function deleteChecklistItem(id: string) {
  await db.delete(checklistItems).where(eq(checklistItems.id, id));
  revalidateEverything();
}

// ---------- Materials ----------

export async function addMaterial(
  detailId: string,
  description: string,
  qty: string,
  unitCost: string,
  link?: { productUrl?: string | null; retailerName?: string | null }
) {
  if (!description.trim()) return;
  const productUrl = link?.productUrl ? sanitizeProductUrl(link.productUrl) : null;
  const retailerName = productUrl ? link?.retailerName?.trim() || retailerNameFromUrl(productUrl) : null;
  await db.insert(materialItems).values({
    detailId,
    description: description.trim(),
    roughQuantity: qty || "1",
    roughUnitCost: unitCost || "0",
    status: "idea",
    productUrl,
    retailerName,
  });
  revalidateEverything();
}

export async function updateMaterial(
  id: string,
  patch: Partial<{
    description: string;
    roughQuantity: string;
    roughUnitCost: string;
    status: string;
    productUrl: string | null;
    retailerName: string | null;
  }>
) {
  const next = { ...patch };
  if ("productUrl" in next) {
    next.productUrl = next.productUrl ? sanitizeProductUrl(next.productUrl) : null;
    if (!next.productUrl && !("retailerName" in patch)) {
      next.retailerName = null;
    }
  }
  if ("retailerName" in next) {
    next.retailerName = next.retailerName?.trim() || null;
  }
  await db.update(materialItems).set(next).where(eq(materialItems.id, id));
  revalidateEverything();
}

export async function deleteMaterial(id: string) {
  await db.transaction(async (tx) => {
    // Detach, don't destroy — an actual-spend entry logged against this
    // material survives as a general (unlinked) line item.
    await tx.update(lineItems).set({ materialId: null }).where(eq(lineItems.materialId, id));
    await tx.delete(materialItems).where(eq(materialItems.id, id));
  });
  revalidateEverything();
}

// ---------- Line items (actual spend) ----------

export async function addLineItem(
  detailId: string,
  description: string,
  cost: string,
  vendor: string,
  date: string,
  materialId?: string | null
) {
  if (!description.trim()) return;
  await db.insert(lineItems).values({
    detailId,
    materialId: materialId || null,
    description: description.trim(),
    cost: cost || "0",
    vendor: vendor.trim() || null,
    date: date || new Date().toISOString().slice(0, 10),
  });
  revalidateEverything();
}

export async function updateLineItem(
  id: string,
  patch: Partial<{ description: string; cost: string; vendor: string | null; date: string; materialId: string | null }>
) {
  await db.update(lineItems).set(patch).where(eq(lineItems.id, id));
  revalidateEverything();
}

export async function deleteLineItem(id: string) {
  await db.delete(lineItems).where(eq(lineItems.id, id));
  revalidateEverything();
}

// ---------- Mood board / Reference collection (Phase 3) ----------
// Mood board and Reference collection share this same image-collection
// mechanic (upload or paste an image URL) but are kept as separate
// collections (boardType) since they answer different questions — "what
// should this look like" vs. "how does this go together" — per the
// brief's own reasoning (section 7).

// Accepts whichever of detailId / roomId / houseId the caller has at upload
// time — a detail's own panel passes detailId, a room's Lookbook section
// passes roomId, and the house-level "inspiration to sort" uploader passes
// houseId directly with neither. Every new row is house-owned (houseId
// always resolved and stored) with the specific detail/room, if any,
// recorded as a tag in the join tables rather than on the row itself.
export async function addBoardImage(formData: FormData) {
  const detailId = String(formData.get("detailId") || "") || null;
  const roomId = String(formData.get("roomId") || "") || null;
  let houseId = String(formData.get("houseId") || "") || null;
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

  if (!houseId && detailId) {
    const [detail] = await db.select().from(details).where(eq(details.id, detailId)).limit(1);
    houseId = detail?.houseId ?? null;
  }
  if (!houseId && roomId) {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);
    houseId = room?.houseId ?? null;
  }
  if (!houseId) return;

  const [image] = await db
    .insert(boardImages)
    .values({ houseId, boardType, assetId, sourceUrl: sourceUrl || null, notes })
    .returning();
  if (detailId) {
    await db.insert(boardImageDetails).values({ boardImageId: image.id, detailId });
  } else if (roomId) {
    await db.insert(boardImageRooms).values({ boardImageId: image.id, roomId });
  }
  revalidateEverything();
}

export async function assignBoardImageToDetail(boardImageId: string, detailId: string) {
  const [existing] = await db
    .select()
    .from(boardImageDetails)
    .where(and(eq(boardImageDetails.boardImageId, boardImageId), eq(boardImageDetails.detailId, detailId)))
    .limit(1);
  if (existing) return;
  await db.insert(boardImageDetails).values({ boardImageId, detailId });
  revalidateEverything();
}

export async function unassignBoardImageFromDetail(boardImageId: string, detailId: string) {
  await db
    .delete(boardImageDetails)
    .where(and(eq(boardImageDetails.boardImageId, boardImageId), eq(boardImageDetails.detailId, detailId)));
  revalidateEverything();
}

export async function assignBoardImageToRoom(boardImageId: string, roomId: string) {
  const [existing] = await db
    .select()
    .from(boardImageRooms)
    .where(and(eq(boardImageRooms.boardImageId, boardImageId), eq(boardImageRooms.roomId, roomId)))
    .limit(1);
  if (existing) return;
  await db.insert(boardImageRooms).values({ boardImageId, roomId });
  revalidateEverything();
}

export async function unassignBoardImageFromRoom(boardImageId: string, roomId: string) {
  await db
    .delete(boardImageRooms)
    .where(and(eq(boardImageRooms.boardImageId, boardImageId), eq(boardImageRooms.roomId, roomId)));
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
  await db.delete(boardImageDetails).where(eq(boardImageDetails.boardImageId, id));
  await db.delete(boardImageRooms).where(eq(boardImageRooms.boardImageId, id));
  await db.delete(boardImages).where(eq(boardImages.id, id));
  revalidateEverything();
}

// ---------- Progress photos (Phase 3) ----------

// A detail-scoped upload (detailId given, the existing per-detail panel's
// flow) keeps a direct provenance link on progressPhotos.detailId AND gets
// one progressPhotoDetails row — the room-level gallery for that detail's
// room then finds it automatically via photosForRoom, no extra write. A
// room-scoped upload (roomId given, no detailId — the new path) just sets
// roomId and creates no link row yet, landing in that room's gallery with
// no detail attached until someone assigns it.
export async function addProgressPhoto(formData: FormData) {
  const detailId = String(formData.get("detailId") || "") || null;
  const roomId = String(formData.get("roomId") || "") || null;
  const phase = String(formData.get("phase") || "");
  const notes = String(formData.get("notes") || "").trim();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;
  if (!detailId && !roomId) return;

  const saved = await saveAsset(file);
  const [assetRow] = await db.insert(assets).values(saved).returning();
  const [photo] = await db
    .insert(progressPhotos)
    .values({ detailId, roomId: detailId ? null : roomId, phase, assetId: assetRow.id, notes })
    .returning();
  if (detailId) {
    await db.insert(progressPhotoDetails).values({ progressPhotoId: photo.id, detailId });
  }
  revalidateEverything();
}

export async function assignProgressPhotoToDetail(photoId: string, detailId: string) {
  const [existing] = await db
    .select()
    .from(progressPhotoDetails)
    .where(and(eq(progressPhotoDetails.progressPhotoId, photoId), eq(progressPhotoDetails.detailId, detailId)))
    .limit(1);
  if (existing) return;
  await db.insert(progressPhotoDetails).values({ progressPhotoId: photoId, detailId });
  revalidateEverything();
}

export async function unassignProgressPhotoFromDetail(photoId: string, detailId: string) {
  await db
    .delete(progressPhotoDetails)
    .where(and(eq(progressPhotoDetails.progressPhotoId, photoId), eq(progressPhotoDetails.detailId, detailId)));
  revalidateEverything();
}

export async function deleteProgressPhoto(id: string) {
  await db.delete(progressPhotoDetails).where(eq(progressPhotoDetails.progressPhotoId, id));
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
  const houseId = String(formData.get("houseId") || "");
  const force = formData.get("force") === "true";
  if (!file || file.size === 0) return { error: "No file provided." };
  if (!houseId) return { error: "No house selected." };

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
    .values({ assetId: assetRow.id, houseId, imageHash: hash, status: "new" })
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
