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
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
  await db.insert(houses).values({ name: name.trim(), address: address.trim() || null });
  revalidateEverything();
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

export async function addInboxItem(text: string) {
  if (!text.trim()) return;
  await db.insert(inboxItems).values({ type: "note", text: text.trim(), source: "manual" });
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
