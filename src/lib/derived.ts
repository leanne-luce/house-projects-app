// Derived/computed values, ported 1:1 from the prototype's pure functions
// (roughCost, actualCost, houseRollup, roomRollup, detailPath) — see
// PLAN.md's "Derived values" section. These take already-fetched rows
// (from src/lib/queries.ts) rather than querying per-call, mirroring the
// prototype's approach of computing over the in-memory state object.

import { num } from "./format";
import type {
  boardImageDetails,
  boardImageRooms,
  boardImages,
  details,
  houses,
  lineItems,
  materialItems,
  progressPhotoDetails,
  progressPhotos,
  rooms,
} from "@/db/schema";

type Detail = typeof details.$inferSelect;
type House = typeof houses.$inferSelect;
type Room = typeof rooms.$inferSelect;
type MaterialItem = typeof materialItems.$inferSelect;
type LineItem = typeof lineItems.$inferSelect;
type ProgressPhoto = typeof progressPhotos.$inferSelect;
type ProgressPhotoDetailLink = typeof progressPhotoDetails.$inferSelect;
type BoardImage = typeof boardImages.$inferSelect;
type BoardImageDetailLink = typeof boardImageDetails.$inferSelect;
type BoardImageRoomLink = typeof boardImageRooms.$inferSelect;

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

// A furniture-tagged detail's spend is money for the thing itself (a couch,
// a lamp), not the renovation work — kept out of the normal budget totals
// and surfaced separately instead (see furnitureRollup below).
export function nonFurniture(ds: Detail[]): Detail[] {
  return ds.filter((d) => !d.isFurniture);
}
export function furnitureOnly(ds: Detail[]): Detail[] {
  return ds.filter((d) => d.isFurniture);
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
  return detailsRollup(nonFurniture(detailsForHouse(allDetails, houseId)), materials, lines);
}

export function roomRollup(allDetails: Detail[], materials: MaterialItem[], lines: LineItem[], roomId: string) {
  return detailsRollup(nonFurniture(detailsForRoom(allDetails, roomId)), materials, lines);
}

// Same shape as houseRollup, but for the furniture-tagged details a normal
// rollup excludes — lets callers show "Furniture: $X" with the same
// money()/budgetDeltaLabel() formatting code as every other rollup figure.
// houseId omitted means "across every house" (the Furniture gallery's use).
export function furnitureRollup(
  allDetails: Detail[],
  materials: MaterialItem[],
  lines: LineItem[],
  houseId?: string
) {
  const scoped = houseId ? detailsForHouse(allDetails, houseId) : allDetails;
  return detailsRollup(furnitureOnly(scoped), materials, lines);
}

// A photo's "does this belong to detail X" answer always goes through
// progressPhotoDetails now, never progressPhotos.detailId directly — that
// column is kept only as inert provenance (see the schema comment).
export function photosForDetail(
  photos: ProgressPhoto[],
  links: ProgressPhotoDetailLink[],
  detailId: string
): ProgressPhoto[] {
  const photoIds = new Set(links.filter((l) => l.detailId === detailId).map((l) => l.progressPhotoId));
  return photos.filter((p) => photoIds.has(p.id));
}

// A room's gallery is the union of photos uploaded directly to the room
// (roomId set, no detail chosen) and every photo linked to any detail
// inside that room — so a photo uploaded through a detail's own panel shows
// up here automatically, with nothing extra to write at upload time.
export function photosForRoom(
  photos: ProgressPhoto[],
  links: ProgressPhotoDetailLink[],
  allDetails: Detail[],
  roomId: string
): ProgressPhoto[] {
  const roomDetailIds = new Set(detailsForRoom(allDetails, roomId).map((d) => d.id));
  const linkedPhotoIds = new Set(
    links.filter((l) => roomDetailIds.has(l.detailId)).map((l) => l.progressPhotoId)
  );
  const seen = new Set<string>();
  const result: ProgressPhoto[] = [];
  for (const p of photos) {
    if ((p.roomId === roomId || linkedPhotoIds.has(p.id)) && !seen.has(p.id)) {
      seen.add(p.id);
      result.push(p);
    }
  }
  return result;
}

// Same "does this belong to X" pattern as progress photos, but boardImages
// has two independent join tables (a detail tag and a room tag are both
// optional and unrelated — an image can have either, both, or neither).
export function inspirationForDetail(
  images: BoardImage[],
  detailLinks: BoardImageDetailLink[],
  detailId: string
): BoardImage[] {
  const imageIds = new Set(detailLinks.filter((l) => l.detailId === detailId).map((l) => l.boardImageId));
  return images.filter((b) => imageIds.has(b.id));
}

export function inspirationForRoom(
  images: BoardImage[],
  detailLinks: BoardImageDetailLink[],
  roomLinks: BoardImageRoomLink[],
  allDetails: Detail[],
  roomId: string
): BoardImage[] {
  const roomDetailIds = new Set(detailsForRoom(allDetails, roomId).map((d) => d.id));
  const viaDetail = new Set(detailLinks.filter((l) => roomDetailIds.has(l.detailId)).map((l) => l.boardImageId));
  const viaRoom = new Set(roomLinks.filter((l) => l.roomId === roomId).map((l) => l.boardImageId));
  return images.filter((b) => viaDetail.has(b.id) || viaRoom.has(b.id));
}

// The "upload now, assign later" bucket shown at the top of a house's
// Lookbook page — every inspiration image that house owns, minus anything
// already tagged to a room or a detail.
export function unassignedInspirationForHouse(
  images: BoardImage[],
  detailLinks: BoardImageDetailLink[],
  roomLinks: BoardImageRoomLink[],
  houseId: string
): BoardImage[] {
  const assignedIds = new Set([...detailLinks.map((l) => l.boardImageId), ...roomLinks.map((l) => l.boardImageId)]);
  return images.filter((b) => b.houseId === houseId && !assignedIds.has(b.id));
}

export function detailPath(allHouses: House[], allRooms: Room[], detail: Detail | null | undefined): string {
  if (!detail) return "—";
  const h = allHouses.find((x) => x.id === detail.houseId);
  const r = detail.roomId ? allRooms.find((x) => x.id === detail.roomId) : null;
  return [h ? h.name : "?", r ? r.name : null, detail.name].filter(Boolean).join(" / ");
}

// Same as detailPath, minus the house name — for the now-per-house pages
// (Receipts, Lookbook, Overview) where the house is already established by
// the page's own house switcher, so repeating it on every row is noise.
export function roomPath(
  allRooms: Room[],
  detail: Pick<Detail, "roomId" | "name"> | null | undefined
): string {
  if (!detail) return "—";
  const r = detail.roomId ? allRooms.find((x) => x.id === detail.roomId) : null;
  return [r ? r.name : null, detail.name].filter(Boolean).join(" / ");
}
