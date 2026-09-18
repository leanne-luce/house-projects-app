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

// `actual` is an optional third input: when a Detail has neither a manual
// override nor any materials (rough === 0), there's no real budget to
// compare against at all — falling back to 0 there made every dollar of
// real spend look "over budget" against a budget nobody ever set. Falling
// back to `actual` instead means an unbudgeted Detail reads as exactly on
// budget (delta 0) rather than infinitely over, until a real estimate or
// materials plan is entered.
export function estimatedSpendFor(
  detail: Pick<Detail, "estimatedSpend" | "id">,
  materials: MaterialItem[],
  actual = 0
): number {
  if (detail.estimatedSpend !== null && detail.estimatedSpend !== undefined) {
    return num(detail.estimatedSpend);
  }
  const rough = roughCost(materials, detail.id);
  return rough > 0 ? rough : actual;
}

// True only when a Detail has a real, entered budget (a manual override or
// a non-empty materials plan) to compare spend against — as opposed to the
// estimatedSpendFor() fallback above, which stands in a number for display
// but isn't a budget anyone actually set.
export function hasRealBudget(detail: Pick<Detail, "estimatedSpend" | "id">, materials: MaterialItem[]): boolean {
  return (
    (detail.estimatedSpend !== null && detail.estimatedSpend !== undefined && num(detail.estimatedSpend) > 0) ||
    roughCost(materials, detail.id) > 0
  );
}

export function detailsRollup(ds: Detail[], materials: MaterialItem[], lines: LineItem[]) {
  let planned = 0;
  let actual = 0;
  let over = 0;
  let remaining = 0;
  let done = 0;
  const counts: Record<string, number> = { not_started: 0, in_progress: 0, done: 0, on_hold: 0 };
  for (const d of ds) {
    const act = actualCost(lines, d.id);
    const est = estimatedSpendFor(d, materials, act);
    planned += est;
    actual += act;
    if (hasRealBudget(d, materials)) {
      if (act > est) over += act - est;
      else remaining += est - act;
    }
    const key = d.status || "not_started";
    counts[key] = (counts[key] || 0) + 1;
    if (key === "done") done++;
  }
  return { count: ds.length, rough: planned, actual, over, remaining, done, counts };
}

export function houseRollup(allDetails: Detail[], materials: MaterialItem[], lines: LineItem[], houseId: string) {
  return detailsRollup(detailsForHouse(allDetails, houseId), materials, lines);
}

export function roomRollup(allDetails: Detail[], materials: MaterialItem[], lines: LineItem[], roomId: string) {
  return detailsRollup(detailsForRoom(allDetails, roomId), materials, lines);
}

export function detailPath(allHouses: House[], allRooms: Room[], detail: Detail | null | undefined): string {
  if (!detail) return "—";
  const h = allHouses.find((x) => x.id === detail.houseId);
  const r = detail.roomId ? allRooms.find((x) => x.id === detail.roomId) : null;
  return [h ? h.name : "?", r ? r.name : null, detail.name].filter(Boolean).join(" / ");
}
