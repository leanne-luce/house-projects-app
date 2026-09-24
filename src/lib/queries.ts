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
  boardImages,
  boardImageDetails,
  boardImageRooms,
  paletteSwatches,
  progressPhotos,
  progressPhotoDetails,
  receipts,
  receiptLineItems,
  assets,
  housePaletteColors,
  detailPaletteColors,
} from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { photosForDetail, inspirationForDetail } from "./derived";

export async function getHousesTreeData() {
  const [housesRows, roomsRows, detailsRows, materialsRows, lineItemsRows, paletteColorRows, colorLinkRows] =
    await Promise.all([
      db.select().from(houses).orderBy(asc(houses.createdAt)),
      db.select().from(rooms).orderBy(asc(rooms.createdAt)),
      db.select().from(details).orderBy(asc(details.createdAt)),
      db.select().from(materialItems),
      db.select().from(lineItems),
      db.select().from(housePaletteColors).orderBy(asc(housePaletteColors.createdAt)),
      db.select().from(detailPaletteColors),
    ]);
  return {
    houses: housesRows,
    rooms: roomsRows,
    details: detailsRows,
    materialItems: materialsRows,
    lineItems: lineItemsRows,
    paletteColors: paletteColorRows,
    detailPaletteColors: colorLinkRows,
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
    allBoardImages,
    allBoardImageDetailLinks,
    allSwatches,
    allProgressPhotos,
    allProgressPhotoLinks,
    allReceiptLineItems,
    allReceipts,
    allAssets,
    allPaletteColors,
    allDetailPaletteColorLinks,
  ] = await Promise.all([
    db.select().from(houses),
    db.select().from(rooms),
    db.select().from(details),
    db.select().from(houses).orderBy(asc(houses.createdAt)),
    db.select().from(materialItems),
    db.select().from(lineItems),
    db.select().from(checklistItems),
    db.select().from(boardImages).orderBy(asc(boardImages.createdAt)),
    db.select().from(boardImageDetails),
    db.select().from(paletteSwatches).orderBy(asc(paletteSwatches.createdAt)),
    db.select().from(progressPhotos).orderBy(asc(progressPhotos.createdAt)),
    db.select().from(progressPhotoDetails),
    db.select().from(receiptLineItems),
    db.select().from(receipts),
    db.select().from(assets),
    db.select().from(housePaletteColors).orderBy(asc(housePaletteColors.createdAt)),
    db.select().from(detailPaletteColors),
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
    allDetails: detailRows,
    boardImages: inspirationForDetail(allBoardImages, allBoardImageDetailLinks, detailId),
    paletteSwatches: allSwatches.filter((s) => s.detailId === detailId),
    progressPhotos: photosForDetail(allProgressPhotos, allProgressPhotoLinks, detailId),
    pendingReceiptItems: allReceiptLineItems.filter((i) => i.status === "pending"),
    receiptDates: Object.fromEntries(
      allReceipts.map((r) => [r.id, r.uploadedAt ? r.uploadedAt.toISOString() : null])
    ),
    contentTypeByAssetId: Object.fromEntries(allAssets.map((a) => [a.id, a.contentType])),
    housePaletteColors: detail ? allPaletteColors.filter((c) => c.houseId === detail.houseId) : [],
    detailPaletteColors: allDetailPaletteColorLinks.filter((l) => l.detailId === detailId),
  };
}

export async function getHorizonData() {
  const detailsRows = await db.select().from(details);
  return { details: detailsRows };
}

export async function getOverviewData() {
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

export async function getLookBookData() {
  const [
    housesRows,
    roomsRows,
    detailsRows,
    photoRows,
    photoLinkRows,
    boardImageRows,
    boardImageDetailRows,
    boardImageRoomRows,
    assetRows,
  ] = await Promise.all([
    db.select().from(houses).orderBy(asc(houses.createdAt)),
    db.select().from(rooms).orderBy(asc(rooms.createdAt)),
    db.select().from(details).orderBy(asc(details.createdAt)),
    db.select().from(progressPhotos).orderBy(asc(progressPhotos.createdAt)),
    db.select().from(progressPhotoDetails),
    db.select().from(boardImages).orderBy(asc(boardImages.createdAt)),
    db.select().from(boardImageDetails),
    db.select().from(boardImageRooms),
    db.select().from(assets),
  ]);
  return {
    houses: housesRows,
    rooms: roomsRows,
    details: detailsRows,
    progressPhotos: photoRows,
    progressPhotoDetails: photoLinkRows,
    boardImages: boardImageRows,
    boardImageDetails: boardImageDetailRows,
    boardImageRooms: boardImageRoomRows,
    contentTypeByAssetId: Object.fromEntries(assetRows.map((a) => [a.id, a.contentType])),
  };
}

export async function getFurnitureData() {
  const [
    housesRows,
    roomsRows,
    allDetails,
    materialsRows,
    lineItemsRows,
    photoRows,
    photoLinkRows,
    boardImageRows,
    boardImageDetailRows,
    assetRows,
  ] = await Promise.all([
    db.select().from(houses).orderBy(asc(houses.createdAt)),
    db.select().from(rooms).orderBy(asc(rooms.createdAt)),
    db.select().from(details).orderBy(asc(details.createdAt)),
    db.select().from(materialItems),
    db.select().from(lineItems),
    db.select().from(progressPhotos).orderBy(asc(progressPhotos.createdAt)),
    db.select().from(progressPhotoDetails),
    db.select().from(boardImages).orderBy(asc(boardImages.createdAt)),
    db.select().from(boardImageDetails),
    db.select().from(assets),
  ]);
  const furnitureDetails = allDetails.filter((d) => d.isFurniture);
  return {
    houses: housesRows,
    rooms: roomsRows,
    details: furnitureDetails,
    materialItems: materialsRows,
    lineItems: lineItemsRows,
    progressPhotos: photoRows,
    progressPhotoDetails: photoLinkRows,
    boardImages: boardImageRows,
    boardImageDetails: boardImageDetailRows,
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
