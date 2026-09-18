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
} from "@/db/schema";
import { asc } from "drizzle-orm";

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
  ] = await Promise.all([
    db.select().from(houses),
    db.select().from(rooms),
    db.select().from(details),
    db.select().from(houses).orderBy(asc(houses.createdAt)),
    db.select().from(materialItems),
    db.select().from(lineItems),
    db.select().from(checklistItems),
    db.select().from(inboxItems),
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
