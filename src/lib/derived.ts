// Derived/computed values, ported 1:1 from the prototype's pure functions
// (roughCost, actualCost, houseRollup, roomRollup, detailPath) — see
// PLAN.md's "Derived values" section. These take already-fetched rows
// (from src/lib/queries.ts) rather than querying per-call, mirroring the
// prototype's approach of computing over the in-memory state object.

import { num } from "./format";
import type { details, houses, lineItems, materialItems, rooms } from "@/db/schema";

type Detail = typeof details.$inferSelect;
type House = typeof houses.$inferSelect;
type Room = typeof rooms.$inferSelect;
type MaterialItem = typeof materialItems.$inferSelect;
type LineItem = typeof lineItems.$inferSelect;

export function detailsForHouse(allDetails: Detail[], houseId: string) {
  return allDetails.filter((d) => d.houseId === houseId);
}
export function detailsForRoom(allDetails: Detail[], roomId: string) {
  return allDetails.filter((d) => d.roomId === roomId);
}
export function detailsDirectOnHouse(allDetails: Detail[], houseId: string) {
  return allDetails.filter((d) => d.houseId === houseId && !d.roomId);
}
export function roomsForHouse(allRooms: Room[], houseId: string) {
  return allRooms.filter((r) => r.houseId === houseId);
}

export function roughCost(materials: MaterialItem[], detailId: string): number {
  return materials
    .filter((m) => m.detailId === detailId)
    .reduce((sum, m) => sum + num(m.roughQuantity) * num(m.roughUnitCost), 0);
}

export function actualCost(lines: LineItem[], detailId: string): number {
  return lines.filter((l) => l.detailId === detailId).reduce((sum, l) => sum + num(l.cost), 0);
}

export function estimatedSpendFor(
  detail: Pick<Detail, "estimatedSpend" | "id">,
  materials: MaterialItem[]
): number {
  if (detail.estimatedSpend === null || detail.estimatedSpend === undefined) {
    return roughCost(materials, detail.id);
  }
  return num(detail.estimatedSpend);
}

export function houseRollup(allDetails: Detail[], materials: MaterialItem[], lines: LineItem[], houseId: string) {
  const ds = detailsForHouse(allDetails, houseId);
  let rough = 0;
  let actual = 0;
  const counts: Record<string, number> = { not_started: 0, in_progress: 0, done: 0, on_hold: 0 };
  for (const d of ds) {
    rough += roughCost(materials, d.id);
    actual += actualCost(lines, d.id);
    const key = d.status || "not_started";
    counts[key] = (counts[key] || 0) + 1;
  }
  return { count: ds.length, rough, actual, counts };
}

export function roomRollup(allDetails: Detail[], materials: MaterialItem[], lines: LineItem[], roomId: string) {
  const ds = detailsForRoom(allDetails, roomId);
  let rough = 0;
  let actual = 0;
  for (const d of ds) {
    rough += roughCost(materials, d.id);
    actual += actualCost(lines, d.id);
  }
  return { count: ds.length, rough, actual };
}

export function detailPath(allHouses: House[], allRooms: Room[], detail: Detail | null | undefined): string {
  if (!detail) return "—";
  const h = allHouses.find((x) => x.id === detail.houseId);
  const r = detail.roomId ? allRooms.find((x) => x.id === detail.roomId) : null;
  return [h ? h.name : "?", r ? r.name : null, detail.name].filter(Boolean).join(" / ");
}
