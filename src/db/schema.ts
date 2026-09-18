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
  createdAt: createdAt(),
});

export const rooms = pgTable("rooms", {
  id: id(),
  houseId: text("house_id")
    .notNull()
    .references(() => houses.id),
  name: text("name").notNull(),
  createdAt: createdAt(),
});

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
    detailId: text("detail_id")
      .notNull()
      .references(() => details.id),
    boardType: text("board_type").notNull(),
    assetId: text("asset_id").references(() => assets.id),
    sourceUrl: text("source_url"),
    notes: text("notes"),
    createdAt: createdAt(),
  },
  (table) => [check("board_type_check", sql`${table.boardType} in ('mood','reference')`)]
);

export const paletteSwatches = pgTable("palette_swatches", {
  id: id(),
  detailId: text("detail_id")
    .notNull()
    .references(() => details.id),
  hex: text("hex").notNull().default("#9D8B5E"),
  label: text("label"),
  createdAt: createdAt(),
});

export const PHASE_VALUES = ["before", "during", "after"] as const;

export const progressPhotos = pgTable(
  "progress_photos",
  {
    id: id(),
    detailId: text("detail_id")
      .notNull()
      .references(() => details.id),
    phase: text("phase").notNull(),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id),
    notes: text("notes"),
    createdAt: createdAt(),
  },
  (table) => [check("phase_check", sql`${table.phase} in ('before','during','after')`)]
);

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
