// Read queries. Personal-scale data (a handful of houses/rooms/details) means
// "fetch everything, group in memory" is simplest and fast enough — same
// approach the prototype took with its in-memory `state` object.

import { db } from "@/db";
import {
  houses,
  rooms,
  details,
  materialItems,
  lineItems,
  checklistItems,
  inboxItems,
  boardImages,
  paletteSwatches,
  progressPhotos,
  receipts,
  receiptLineItems,
  assets,
} from "@/db/schema";
import { asc, desc } from "drizzle-orm";

export async function getHousesTreeData() {
  const [housesRows, roomsRows, detailsRows, materialsRows, lineItemsRows] = await Promise.all([
    db.select().from(houses).orderBy(asc(houses.createdAt)),
    db.select().from(rooms).orderBy(asc(rooms.createdAt)),
    db.select().from(details).orderBy(asc(details.createdAt)),
    db.select().from(materialItems),
    db.select().from(lineItems),
  ]);
  return {
    houses: housesRows,
    rooms: roomsRows,
    details: detailsRows,
    materialItems: materialsRows,
    lineItems: lineItemsRows,
  };
}

export async function getDetailPageData(detailId: string) {
  const [
    houseRows,
    roomRows,
    detailRows,
    allHouses,
    materials,
    lines,
    checklist,
    filedInbox,
    allBoardImages,
    allSwatches,
    allProgressPhotos,
    allReceiptLineItems,
    allReceipts,
    allAssets,
  ] = await Promise.all([
    db.select().from(houses),
    db.select().from(rooms),
    db.select().from(details),
    db.select().from(houses).orderBy(asc(houses.createdAt)),
    db.select().from(materialItems),
    db.select().from(lineItems),
    db.select().from(checklistItems),
    db.select().from(inboxItems),
    db.select().from(boardImages).orderBy(asc(boardImages.createdAt)),
    db.select().from(paletteSwatches).orderBy(asc(paletteSwatches.createdAt)),
    db.select().from(progressPhotos).orderBy(asc(progressPhotos.createdAt)),
    db.select().from(receiptLineItems),
    db.select().from(receipts),
    db.select().from(assets),
  ]);
  const detail = detailRows.find((d) => d.id === detailId) || null;
  return {
    detail,
    houses: houseRows,
    rooms: roomRows,
    allHouses,
    materialItems: materials.filter((m) => m.detailId === detailId),
    lineItems: lines.filter((l) => l.detailId === detailId),
    checklistItems: checklist.filter((c) => c.detailId === detailId),
    filedInbox: filedInbox.filter((i) => i.filedTo === detailId),
    allDetails: detailRows,
    boardImages: allBoardImages.filter((b) => b.detailId === detailId),
    paletteSwatches: allSwatches.filter((s) => s.detailId === detailId),
    progressPhotos: allProgressPhotos.filter((p) => p.detailId === detailId),
    pendingReceiptItems: allReceiptLineItems.filter((i) => i.status === "pending"),
    receiptDates: Object.fromEntries(
      allReceipts.map((r) => [r.id, r.uploadedAt ? r.uploadedAt.toISOString() : null])
    ),
    contentTypeByAssetId: Object.fromEntries(allAssets.map((a) => [a.id, a.contentType])),
  };
}

export async function getInboxTabData() {
  const [items, detailsRows, housesRows, roomsRows] = await Promise.all([
    db.select().from(inboxItems),
    db.select().from(details).orderBy(asc(details.createdAt)),
    db.select().from(houses).orderBy(asc(houses.createdAt)),
    db.select().from(rooms).orderBy(asc(rooms.createdAt)),
  ]);
  return {
    unfiled: items
      .filter((i) => !i.filedTo)
      .sort((a, b) => (b.createdAt?.toISOString() ?? "").localeCompare(a.createdAt?.toISOString() ?? "")),
    details: detailsRows,
    houses: housesRows,
    rooms: roomsRows,
  };
}

export async function getHorizonData() {
  const detailsRows = await db.select().from(details);
  return { details: detailsRows };
}

export async function getOverviewData() {
  const [housesRows, roomsRows, detailsRows, materialsRows, lineItemsRows, inboxRows] =
    await Promise.all([
      db.select().from(houses).orderBy(asc(houses.createdAt)),
      db.select().from(rooms).orderBy(asc(rooms.createdAt)),
      db.select().from(details).orderBy(asc(details.createdAt)),
      db.select().from(materialItems),
      db.select().from(lineItems),
      db.select().from(inboxItems),
    ]);
  return {
    houses: housesRows,
    rooms: roomsRows,
    details: detailsRows,
    materialItems: materialsRows,
    lineItems: lineItemsRows,
    inboxItems: inboxRows,
  };
}

export async function getLookBookData() {
  const [housesRows, roomsRows, detailsRows, photoRows, assetRows] = await Promise.all([
    db.select().from(houses).orderBy(asc(houses.createdAt)),
    db.select().from(rooms).orderBy(asc(rooms.createdAt)),
    db.select().from(details).orderBy(asc(details.createdAt)),
    db.select().from(progressPhotos).orderBy(asc(progressPhotos.createdAt)),
    db.select().from(assets),
  ]);
  return {
    houses: housesRows,
    rooms: roomsRows,
    details: detailsRows,
    progressPhotos: photoRows,
    contentTypeByAssetId: Object.fromEntries(assetRows.map((a) => [a.id, a.contentType])),
  };
}

export async function getReceiptsTabData() {
  const [receiptRows, itemRows, detailsRows, housesRows, roomsRows, assetRows] = await Promise.all([
    db.select().from(receipts).orderBy(desc(receipts.uploadedAt)),
    db.select().from(receiptLineItems).orderBy(asc(receiptLineItems.createdAt)),
    db.select().from(details).orderBy(asc(details.createdAt)),
    db.select().from(houses).orderBy(asc(houses.createdAt)),
    db.select().from(rooms).orderBy(asc(rooms.createdAt)),
    db.select().from(assets),
  ]);
  const contentTypeByAssetId = Object.fromEntries(assetRows.map((a) => [a.id, a.contentType]));
  return {
    receipts: receiptRows,
    receiptLineItems: itemRows,
    details: detailsRows,
    houses: housesRows,
    rooms: roomsRows,
    contentTypeByAssetId,
  };
}
