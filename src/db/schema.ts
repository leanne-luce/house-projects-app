// Postgres schema for House Projects Hub.
//
// Table/column names intentionally mirror the field names from the prototype's
// data model (build brief section 6) so the mapping stays legible. Deviations
// from that model are called out inline with a `// DEVIATION:` comment —
// see the plan doc for the full rationale on each one.

import {
  pgTable,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// DEVIATION (plan section "Data model" #1): the prototype's assetId/sourceUrl
// fields pointed into an opaque per-artifact blob store. A real app needs an
// actual record of what got uploaded and where it lives (a Vercel Blob URL).
export const assets = pgTable("assets", {
  id: id(),
  url: text("url").notNull(),
  contentType: text("content_type"),
  sizeBytes: integer("size_bytes"),
  uploadedAt: createdAt(),
});

export const houses = pgTable("houses", {
  id: id(),
  name: text("name").notNull(),
  address: text("address"),
  targetBudget: numeric("target_budget"),
  // DEVIATION (addition, not in build brief section 6): what the house cost
  // to buy, added on request so the app can show an "all-in" figure
  // (purchase price + project spend), not just renovation spend on its own.
  purchasePrice: numeric("purchase_price"),
  // DEVIATION (addition, not in build brief section 6): cash actually put
  // down at purchase, added on request so the app can show a "cash in"
  // figure (down payment + project spend) alongside "all-in" — the money
  // actually out of pocket, as distinct from the house's full value.
  downPayment: numeric("down_payment"),
  createdAt: createdAt(),
});

export const PAINT_FINISH_VALUES = ["flat", "matte", "eggshell", "satin", "semi-gloss", "gloss"] as const;

// House-level paint/color log — distinct from paletteSwatches below, which
// is a simpler per-Detail swatch list. This one belongs to a house (one
// property's whole palette), carries the fuller set of fields a real paint
// log needs (brand, color code, finish, where it's used), and is designed
// so a future `details` reference can point at a row here — no such link
// exists yet, this table just gives it a stable id to point at later.
export const housePaletteColors = pgTable(
  "house_palette_colors",
  {
    id: id(),
    houseId: text("house_id")
      .notNull()
      .references(() => houses.id),
    name: text("name").notNull(),
    hex: text("hex").notNull().default("#9D8B5E"),
    brand: text("brand"),
    colorCode: text("color_code"),
    finish: text("finish").notNull().default("flat"),
    whereUsed: text("where_used"),
    notes: text("notes"),
    createdAt: createdAt(),
  },
  (table) => [
    check("house_palette_color_hex_check", sql`${table.hex} ~ '^#[0-9A-Fa-f]{6}$'`),
    check(
      "house_palette_color_finish_check",
      sql`${table.finish} in ('flat','matte','eggshell','satin','semi-gloss','gloss')`
    ),
  ]
);

export const ROOM_GROUP_VALUES = ["interior", "exterior", "utility"] as const;

export const rooms = pgTable(
  "rooms",
  {
    id: id(),
    houseId: text("house_id")
      .notNull()
      .references(() => houses.id),
    name: text("name").notNull(),
    // DEVIATION (addition, on request): groups rooms under the House page's
    // Interior/Exterior/Utility sections. Defaults to 'interior' so a
    // migration backfilling existing rooms never leaves one un-groupable.
    group: text("group").notNull().default("interior"),
    createdAt: createdAt(),
  },
  (table) => [check("room_group_check", sql`${table.group} in ('interior','exterior','utility')`)]
);

export const STATUS_VALUES = ["not_started", "in_progress", "done", "on_hold"] as const;
// DEVIATION (plan section "Data model" #2): the prototype used '' to mean
// "unscheduled" for timeframeGranularity. Postgres represents that as NULL
// instead — same UI behavior (falls into "Someday / unscheduled"), different
// sentinel value.
export const GRANULARITY_VALUES = ["day", "week", "month", "quarter", "year"] as const;

export const details = pgTable(
  "details",
  {
    id: id(),
    houseId: text("house_id")
      .notNull()
      .references(() => houses.id),
    roomId: text("room_id").references(() => rooms.id),
    name: text("name").notNull(),
    status: text("status").notNull().default("not_started"),
    timeframeGranularity: text("timeframe_granularity"),
    timeframeValue: text("timeframe_value"),
    scratchpad: text("scratchpad"),
    estimatedSpend: numeric("estimated_spend"),
    pinterestBoardUrl: text("pinterest_board_url"),
    // DEVIATION (addition, not in build brief section 6): a plain free-text
    // notes field for anything that isn't a calculation (that's what
    // scratchpad is for) — links, stray context, reminders. Added on
    // request.
    notes: text("notes"),
    // DEVIATION (addition, not in build brief section 6): tags a detail as
    // furniture so its spend can be pulled out of the normal budget totals
    // and shown separately (a couch isn't "renovation spend" the same way
    // tile or labor is), and so it can be browsed in its own catalog-style
    // gallery. Added on request.
    isFurniture: boolean("is_furniture").notNull().default(false),
    // DEVIATION (addition, per the "planning layout" design pass): a short
    // freeform target-date string shown inline in the hero meta line
    // ("Target 14 Nov") — distinct from the timeframe granularity/value
    // pair, which buckets a detail into Horizon groups rather than naming
    // one specific date to hit.
    targetDate: text("target_date"),
    createdAt: createdAt(),
  },
  (table) => [
    check("status_check", sql`${table.status} in ('not_started','in_progress','done','on_hold')`),
    check(
      "timeframe_granularity_check",
      sql`${table.timeframeGranularity} is null or ${table.timeframeGranularity} in ('day','week','month','quarter','year')`
    ),
  ]
);

export const checklistItems = pgTable("checklist_items", {
  id: id(),
  detailId: text("detail_id")
    .notNull()
    .references(() => details.id),
  description: text("description").notNull(),
  done: boolean("done").notNull().default(false),
  // DEVIATION (addition, per the "planning layout" design pass): a short
  // freeform display string for the step's date/status — "done 12 Sep",
  // "by 20 Oct", "wk of 10 Nov". Free text rather than a real date so any
  // of those phrasings fits without format-specific rendering logic.
  dueDate: text("due_date"),
  // A short dependency/context sub-line ("Blocks 04 and 05", "Two weeks'
  // notice — waits on 03").
  note: text("note"),
  createdAt: createdAt(),
});

export const MATERIAL_STATUS_VALUES = ["idea", "decided", "need_to_source", "purchased"] as const;

export const materialItems = pgTable(
  "material_items",
  {
    id: id(),
    detailId: text("detail_id")
      .notNull()
      .references(() => details.id),
    description: text("description").notNull(),
    roughQuantity: numeric("rough_quantity").notNull().default("1"),
    roughUnitCost: numeric("rough_unit_cost").notNull().default("0"),
    status: text("status").notNull().default("idea"),
    // DEVIATION (addition, on request): a link to where this material can be
    // bought. Both nullable — optional, so every material added before this
    // existed stays valid. retailerName is auto-derived from productUrl's
    // domain but stays editable by hand (see src/lib/product-link.ts).
    // Fields the page itself will eventually be scraped for (title, price,
    // image, dimensions/coverage) aren't added yet — that's a later task.
    productUrl: text("product_url"),
    retailerName: text("retailer_name"),
    createdAt: createdAt(),
  },
  (table) => [
    check(
      "material_status_check",
      sql`${table.status} in ('idea','decided','need_to_source','purchased')`
    ),
  ]
);

export const lineItems = pgTable("line_items", {
  id: id(),
  detailId: text("detail_id")
    .notNull()
    .references(() => details.id),
  description: text("description").notNull(),
  cost: numeric("cost").notNull().default("0"),
  vendor: text("vendor"),
  date: text("date"), // stored as ISO date string (YYYY-MM-DD), matching prototype
  receiptAssetId: text("receipt_asset_id").references(() => assets.id),
  createdAt: createdAt(),
});

// DEVIATION (plan section "Data model" #4): `source` is new/additive, used by
// Phase 5's email-based capture and a future Chrome extension to tag origin.
export const INBOX_SOURCE_VALUES = ["manual", "email", "extension"] as const;

export const inboxItems = pgTable(
  "inbox_items",
  {
    id: id(),
    type: text("type").notNull(), // 'note' | 'image'
    text: text("text"),
    assetId: text("asset_id").references(() => assets.id),
    filedTo: text("filed_to").references(() => details.id),
    source: text("source").notNull().default("manual"),
    createdAt: createdAt(),
  },
  (table) => [
    check("inbox_type_check", sql`${table.type} in ('note','image')`),
    check("inbox_source_check", sql`${table.source} in ('manual','email','extension')`),
  ]
);

export const BOARD_TYPE_VALUES = ["mood", "reference"] as const;

export const boardImages = pgTable(
  "board_images",
  {
    id: id(),
    // DEVIATION (change, on request): no longer the only way to place an
    // image — kept only for backward-compatible provenance on rows created
    // before house-level inspiration existed. Every new row's real
    // house/room/detail associations live in the two join tables below,
    // even one added straight from a Detail's own panel.
    detailId: text("detail_id").references(() => details.id),
    // Always populated on new rows (resolved from whichever of house/room/
    // detail the upload started from) so a house's Lookbook page can list
    // every inspiration image it owns, assigned or not.
    houseId: text("house_id").references(() => houses.id),
    boardType: text("board_type").notNull(),
    assetId: text("asset_id").references(() => assets.id),
    sourceUrl: text("source_url"),
    notes: text("notes"),
    createdAt: createdAt(),
  },
  (table) => [check("board_type_check", sql`${table.boardType} in ('mood','reference')`)]
);

// Many-to-many, same rationale as progressPhotoDetails: one inspiration
// photo can cover more than one detail (a headboard and a wall mural in the
// same shot, relevant to two different details).
export const boardImageDetails = pgTable("board_image_details", {
  id: id(),
  boardImageId: text("board_image_id")
    .notNull()
    .references(() => boardImages.id),
  detailId: text("detail_id")
    .notNull()
    .references(() => details.id),
  createdAt: createdAt(),
});

// Lets an inspiration image be tagged to a room generally, without picking
// one specific detail in it yet.
export const boardImageRooms = pgTable("board_image_rooms", {
  id: id(),
  boardImageId: text("board_image_id")
    .notNull()
    .references(() => boardImages.id),
  roomId: text("room_id")
    .notNull()
    .references(() => rooms.id),
  createdAt: createdAt(),
});

export const paletteSwatches = pgTable("palette_swatches", {
  id: id(),
  detailId: text("detail_id")
    .notNull()
    .references(() => details.id),
  hex: text("hex").notNull().default("#9D8B5E"),
  label: text("label"),
  createdAt: createdAt(),
});

// Links a Detail to one of its house's palette colors (housePaletteColors
// above) — distinct from paletteSwatches above, which is an older, simpler
// per-Detail freeform swatch list with no link to a house's palette. A
// Detail can link the same color more than once (e.g. the same white used
// for both "trim" and "ceiling" gets two rows). `role` is free text on
// purpose ("such as" walls/trim/ceiling/cabinets in the request that added
// this — examples, not an enum), so it's just a suggestion set in the UI,
// not a CHECK constraint here.
export const detailPaletteColors = pgTable("detail_palette_colors", {
  id: id(),
  detailId: text("detail_id")
    .notNull()
    .references(() => details.id),
  paletteColorId: text("palette_color_id")
    .notNull()
    .references(() => housePaletteColors.id),
  role: text("role"),
  createdAt: createdAt(),
});

export const PHASE_VALUES = ["before", "during", "after"] as const;

export const progressPhotos = pgTable(
  "progress_photos",
  {
    id: id(),
    // DEVIATION (change, on request): kept only as inert provenance ("the
    // detail this was originally uploaded through") — every read now goes
    // through progressPhotoDetails below, which is what lets a photo be
    // assigned to more than one detail. Nullable because a photo can now
    // also be uploaded straight at the room level, with no detail at all.
    detailId: text("detail_id").references(() => details.id),
    // A room-level upload sets this directly; a detail-level upload leaves
    // it null and is found via progressPhotoDetails -> details.roomId
    // instead — so moving a detail to a different room (see the Move panel)
    // carries its photos to the new room's gallery for free, with nothing
    // to update here.
    roomId: text("room_id").references(() => rooms.id),
    phase: text("phase").notNull(),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id),
    notes: text("notes"),
    createdAt: createdAt(),
  },
  (table) => [check("phase_check", sql`${table.phase} in ('before','during','after')`)]
);

// Many-to-many: one photo (e.g. a wide room shot) can be relevant to
// several details ("the headboard in this photo" + "the wall mural in this
// photo"), and a detail can obviously have several photos. The first join
// table in this schema — see progressPhotos' comment above for why.
export const progressPhotoDetails = pgTable("progress_photo_details", {
  id: id(),
  progressPhotoId: text("progress_photo_id")
    .notNull()
    .references(() => progressPhotos.id),
  detailId: text("detail_id")
    .notNull()
    .references(() => details.id),
  createdAt: createdAt(),
});

export const RECEIPT_STATUS_VALUES = ["new", "processing", "logged"] as const;

export const receipts = pgTable(
  "receipts",
  {
    id: id(),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id),
    // DEVIATION (addition, not in build brief section 6): which house this
    // receipt was uploaded for, added on request so Receipts can be a
    // per-house view — chosen at upload time (whichever house's Receipts
    // tab you're on), not inferred from assigned items, since a fresh
    // upload has no assigned items yet to infer from.
    houseId: text("house_id")
      .notNull()
      .references(() => houses.id),
    uploadedAt: createdAt(),
    imageHash: text("image_hash"),
    status: text("status").notNull().default("new"),
    ocrText: text("ocr_text"),
    ocrError: text("ocr_error"),
    // DEVIATION (addition, not in build brief section 6): which store this
    // receipt came from, added on request. Flows into the vendor field of
    // any LineItem created when a receipt line item is assigned, so it
    // doesn't have to be re-typed per item.
    vendor: text("vendor"),
  },
  (table) => [
    check("receipt_status_check", sql`${table.status} in ('new','processing','logged')`),
  ]
);

export const RECEIPT_LINE_ITEM_STATUS_VALUES = ["pending", "assigned", "dismissed"] as const;

export const receiptLineItems = pgTable(
  "receipt_line_items",
  {
    id: id(),
    receiptId: text("receipt_id")
      .notNull()
      .references(() => receipts.id),
    description: text("description").notNull(),
    amount: numeric("amount").notNull().default("0"),
    status: text("status").notNull().default("pending"),
    assignedDetailId: text("assigned_detail_id").references(() => details.id),
    createdAt: createdAt(),
  },
  (table) => [
    check(
      "receipt_line_item_status_check",
      sql`${table.status} in ('pending','assigned','dismissed')`
    ),
  ]
);
