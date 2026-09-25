"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { money, num } from "@/lib/format";
import { actualCost, estimatedSpendFor } from "@/lib/derived";
import { estimateCost } from "@/lib/cost-estimator";
import { sanitizeProductUrl, retailerNameFromUrl } from "@/lib/product-link";
import {
  updateDetail,
  deleteDetail,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  addLineItem,
  updateLineItem,
  deleteLineItem,
  addChecklistItem,
  toggleChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} from "@/lib/actions";
import { Panel } from "@/components/panel";
import { ReferencesPanel } from "./references-panel";
import { NotesPanel } from "./notes-panel";
import { PalettePanel } from "./palette-panel";
import { ColorsSection } from "./colors-section";
import { ProgressPhotosPanel } from "./progress-photos-panel";
import { UnassignedReceiptItemsPanel } from "./unassigned-receipt-items-panel";
import type {
  details as detailsTable,
  houses as housesTable,
  rooms as roomsTable,
  materialItems as materialItemsTable,
  lineItems as lineItemsTable,
  checklistItems as checklistItemsTable,
  boardImages as boardImagesTable,
  paletteSwatches as paletteSwatchesTable,
  progressPhotos as progressPhotosTable,
  receiptLineItems as receiptLineItemsTable,
  housePaletteColors as housePaletteColorsTable,
  detailPaletteColors as detailPaletteColorsTable,
} from "@/db/schema";

type Detail = typeof detailsTable.$inferSelect;
type House = typeof housesTable.$inferSelect;
type Room = typeof roomsTable.$inferSelect;
type MaterialItem = typeof materialItemsTable.$inferSelect;
type LineItem = typeof lineItemsTable.$inferSelect;
type ChecklistItem = typeof checklistItemsTable.$inferSelect;
type BoardImage = typeof boardImagesTable.$inferSelect;
type Swatch = typeof paletteSwatchesTable.$inferSelect;
type ProgressPhoto = typeof progressPhotosTable.$inferSelect;
type ReceiptLineItem = typeof receiptLineItemsTable.$inferSelect;
type PaletteColor = typeof housePaletteColorsTable.$inferSelect;
type DetailPaletteColorLink = typeof detailPaletteColorsTable.$inferSelect;

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
  on_hold: "On hold",
};
const GRAN_LABEL: Record<string, string> = {
  "": "Unscheduled",
  day: "Day",
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
};
const MSTATUS_LABEL: Record<string, string> = {
  idea: "Idea",
  decided: "Ordered",
  need_to_source: "To source",
  purchased: "Have",
};
const STATUS_COLOR: Record<string, string> = {
  not_started: "var(--text-faint)",
  in_progress: "var(--warn)",
  done: "var(--good)",
  on_hold: "var(--danger)",
};

function timeframeValueInput(
  gran: string,
  value: string,
  onChange: (v: string) => void
) {
  // `key={gran}` forces a fresh DOM node whenever the granularity changes
  // (date -> week -> month -> ...), rather than React trying to reconcile
  // one <input> across type changes. Every branch is deliberately
  // uncontrolled (defaultValue, not value) so switching branches never
  // flips a single input between controlled and uncontrolled — that
  // combination is what triggered React's "changing a controlled input to
  // be uncontrolled" warning during testing.
  // `key` must be passed directly on the JSX element, never through a
  // spread object — React specifically warns/ignores it otherwise.
  const common = {
    id: "detailTFValue",
    defaultValue: value,
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => onChange(e.target.value),
  };
  if (gran === "day") return <input key={gran} type="date" {...common} />;
  if (gran === "week") return <input key={gran} type="week" {...common} />;
  if (gran === "month") return <input key={gran} type="month" {...common} />;
  if (gran === "quarter") return <input key={gran} placeholder="e.g. 2026 Q4" {...common} />;
  if (gran === "year") return <input key={gran} type="number" placeholder="2027" {...common} />;
  return <input key={gran} disabled placeholder="—" defaultValue="" />;
}

export function DetailPageClient({
  detail,
  houses,
  rooms,
  materialItems,
  lineItems,
  checklistItems,
  boardImages,
  paletteSwatches,
  progressPhotos,
  pendingReceiptItems,
  receiptDates,
  contentTypeByAssetId,
  housePaletteColors,
  detailPaletteColors,
}: {
  detail: Detail;
  houses: House[];
  rooms: Room[];
  materialItems: MaterialItem[];
  lineItems: LineItem[];
  checklistItems: ChecklistItem[];
  boardImages: BoardImage[];
  paletteSwatches: Swatch[];
  progressPhotos: ProgressPhoto[];
  pendingReceiptItems: ReceiptLineItem[];
  receiptDates: Record<string, string | null>;
  contentTypeByAssetId: Record<string, string | null>;
  housePaletteColors: PaletteColor[];
  detailPaletteColors: DetailPaletteColorLink[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const overrideInputRef = useRef<HTMLInputElement>(null);
  const house = houses.find((h) => h.id === detail.houseId);
  const room = detail.roomId ? rooms.find((r) => r.id === detail.roomId) : null;
  const roomsOfHouse = rooms.filter((r) => r.houseId === detail.houseId);

  const actual = actualCost(lineItems, detail.id);
  const estVal = estimatedSpendFor(detail, materialItems);
  const overBudget = estVal > 0 && actual > estVal;
  const statusColor = STATUS_COLOR[detail.status || "not_started"];
  const backTarget = room ? room.name : house ? house.name : "Houses";

  return (
    <div className="detail-page">
      <div className="db-backbar">
        <button onClick={() => router.push("/houses")}>← {backTarget}</button>
      </div>

      <div className="db-hero" style={{ ["--status-color" as string]: statusColor }}>
        <div className="db-hero-top">
          <div className="db-hero-top-left">
            <div className="db-breadcrumb">
              {house ? house.name : ""}
              {room ? " · " + room.name : ""}
            </div>
            <input
              className="db-name-input"
              defaultValue={detail.name}
              onBlur={(e) => {
                if (e.target.value.trim() && e.target.value !== detail.name) {
                  startTransition(() => updateDetail(detail.id, { name: e.target.value.trim() }));
                }
              }}
            />
          </div>
          <div className="db-hero-stats">
            <div className="db-hero-stat">
              <div className="db-hero-stat-label">Estimate</div>
              <div className="db-hero-stat-value">{money(estVal)}</div>
            </div>
            <div className="db-hero-stat">
              <div className="db-hero-stat-label">Spent</div>
              <div className="db-hero-stat-value">{money(actual)}</div>
            </div>
            <div className="db-hero-stat">
              <div className="db-hero-stat-label">{overBudget ? "Over" : "Left"}</div>
              <div className={`db-hero-stat-value${overBudget ? " over" : ""}`}>
                {money(Math.abs(actual - estVal))}
              </div>
            </div>
          </div>
        </div>

        {/* One line, read like a sentence — status, timeframe, target date,
            budget — rather than a row of separate form controls. Every
            piece is still a real editable input/select, just styled to
            blend into the surrounding text until hovered or focused. */}
        <div className="db-meta">
          <select
            defaultValue={detail.status || "not_started"}
            onChange={(e) => startTransition(() => updateDetail(detail.id, { status: e.target.value }))}
          >
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <span className="db-meta-sep">·</span>
          <select
            defaultValue={detail.timeframeGranularity || ""}
            onChange={(e) =>
              startTransition(() =>
                updateDetail(detail.id, { timeframeGranularity: e.target.value || null, timeframeValue: "" })
              )
            }
          >
            {Object.entries(GRAN_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          {timeframeValueInput(detail.timeframeGranularity || "", detail.timeframeValue || "", (v) =>
            startTransition(() => updateDetail(detail.id, { timeframeValue: v }))
          )}
          <span className="db-meta-sep">·</span>
          <input
            defaultValue={detail.targetDate || ""}
            placeholder="Target date"
            style={{ width: "6.5rem" }}
            onBlur={(e) => {
              if (e.target.value !== (detail.targetDate || "")) {
                startTransition(() => updateDetail(detail.id, { targetDate: e.target.value || null }));
              }
            }}
          />
          <span className="db-meta-sep">·</span>
          <span className={`db-meta-budget${overBudget ? " over" : ""}`}>
            {money(actual)} of {money(estVal)}
          </span>
          <label className="db-meta-furniture">
            <input
              type="checkbox"
              defaultChecked={detail.isFurniture}
              onChange={(e) => startTransition(() => updateDetail(detail.id, { isFurniture: e.target.checked }))}
              style={{ width: "auto", accentColor: "var(--accent-strong)" }}
            />
            Furniture
          </label>
        </div>
      </div>

      {/* The work (sequence, materials) gets the wide column; the
          at-a-glance summaries (money, notes, mood board) sit narrower
          beside it — the two read at different paces, so they don't need
          equal width. */}
      <div className="db-columns">
        <div className="db-col-main">
          <SequencePanel detailId={detail.id} items={checklistItems} />
          <MaterialsPanel detailId={detail.id} materials={materialItems} />
        </div>
        <div className="db-col-side">
          <MoneyPanel
            estVal={estVal}
            actual={actual}
            overBudget={overBudget}
            overrideInputRef={overrideInputRef}
            onOverride={(value) => startTransition(() => updateDetail(detail.id, { estimatedSpend: value }))}
            onEstimateGuess={() => {
              const guess = estimateCost(detail.name);
              if (guess === null) {
                alert(
                  `No rough estimate on file for "${detail.name}" yet — try a more common material/room keyword, or just enter a number by hand.`
                );
                return null;
              }
              startTransition(() => updateDetail(detail.id, { estimatedSpend: String(guess) }));
              return guess;
            }}
          />
          <SpendPanel detailId={detail.id} lines={lineItems} estVal={estVal} />
          <NotesPanel detailId={detail.id} notes={detail.notes} />
          <ReferencesPanel
            detailId={detail.id}
            houseId={detail.houseId}
            images={boardImages}
            pinterestBoardUrl={detail.pinterestBoardUrl}
          />
        </div>
      </div>

      <div className="panel-grid">
        <ProgressPhotosPanel
          detailId={detail.id}
          houseId={detail.houseId}
          photos={progressPhotos}
          contentTypeByAssetId={contentTypeByAssetId}
        />

        <PalettePanel detailId={detail.id} swatches={paletteSwatches} />

        <ColorsSection detailId={detail.id} houseColors={housePaletteColors} links={detailPaletteColors} />

        <UnassignedReceiptItemsPanel detailId={detail.id} items={pendingReceiptItems} receiptDates={receiptDates} />

        <Panel title="Move">
          <div className="move-row">
            <select
              defaultValue={detail.houseId}
              onChange={(e) => startTransition(() => updateDetail(detail.id, { houseId: e.target.value, roomId: null }))}
            >
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
            <select
              defaultValue={detail.roomId || ""}
              onChange={(e) => startTransition(() => updateDetail(detail.id, { roomId: e.target.value || null }))}
            >
              <option value="">No specific room</option>
              {roomsOfHouse.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </Panel>

        <Panel title="Danger zone" span2 danger>
          <button
            className="ghost"
            style={{ color: "var(--danger)", borderColor: "var(--danger-soft)" }}
            onClick={() => {
              if (
                confirm(
                  "Delete this detail and everything logged under it (materials, spend, checklist)? This can't be undone."
                )
              ) {
                startTransition(async () => {
                  await deleteDetail(detail.id);
                  router.push("/houses");
                });
              }
            }}
          >
            Delete this detail
          </button>
        </Panel>
      </div>
    </div>
  );
}

// The hero used to carry Estimated/Actual bars directly; those moved here
// so the hero reads as a single sentence and the money detail — including
// the manual override, which is still the same estimatedSpend field the
// rest of the app already reads — lives with the rest of the budget work.
function MoneyPanel({
  estVal,
  actual,
  overBudget,
  overrideInputRef,
  onOverride,
  onEstimateGuess,
}: {
  estVal: number;
  actual: number;
  overBudget: boolean;
  overrideInputRef: React.RefObject<HTMLInputElement | null>;
  onOverride: (value: string | null) => void;
  onEstimateGuess: () => number | null;
}) {
  const maxBar = Math.max(estVal, actual, 1);
  const estPct = Math.min(100, Math.round((estVal / maxBar) * 100));
  const actPct = Math.min(100, Math.round((actual / maxBar) * 100));
  const diff = actual - estVal;
  return (
    <Panel title="Money">
      <div className="db-money-row">
        <span className="db-money-label">Estimated</span>
        <div className="db-money-bar">
          <div className="db-money-bar-fill" style={{ width: `${estPct}%`, background: "var(--accent)" }} />
        </div>
        <input
          ref={overrideInputRef}
          type="number"
          min={0}
          step="any"
          defaultValue={estVal}
          className="db-money-value-input"
          onBlur={(e) => onOverride(e.target.value === "" ? null : e.target.value)}
        />
      </div>
      <div className="db-money-row">
        <span className="db-money-label">Spent</span>
        <div className="db-money-bar">
          <div
            className="db-money-bar-fill"
            style={{ width: `${actPct}%`, background: overBudget ? "var(--danger)" : "var(--good)" }}
          />
        </div>
        <span className="db-money-value">{money(actual)}</span>
      </div>
      <div className="db-money-summary">
        <span style={{ color: overBudget ? "var(--danger)" : undefined }}>
          {overBudget ? `${money(diff)} over.` : `${money(-diff)} left.`}
        </span>
        <a href="#panel-spend" className="link-btn">
          Log spend
        </a>
        <button
          type="button"
          className="link-btn"
          title="Fill in a rough ballpark cost based on the detail's name — a heuristic guess, not a quote"
          onClick={() => {
            const guess = onEstimateGuess();
            if (guess !== null && overrideInputRef.current) overrideInputRef.current.value = String(guess);
          }}
        >
          Estimate
        </button>
      </div>
    </Panel>
  );
}

// Sorted roughly by how urgently each material needs attention — not
// tracked lead times, but a reasonable stand-in with the data on hand.
const MATERIAL_URGENCY: Record<string, number> = { need_to_source: 0, decided: 1, idea: 2, purchased: 3 };

function MaterialsPanel({ detailId, materials }: { detailId: string; materials: MaterialItem[] }) {
  const sorted = [...materials].sort(
    (a, b) => (MATERIAL_URGENCY[a.status] ?? 9) - (MATERIAL_URGENCY[b.status] ?? 9)
  );
  const planned = sorted.reduce((sum, m) => sum + num(m.roughQuantity) * num(m.roughUnitCost), 0);
  return (
    <Panel
      title={
        <div className="db-panel-title-row">
          <span>Materials plan</span>
          {sorted.length ? <span className="db-panel-title-total">{money(planned)} planned</span> : null}
        </div>
      }
    >
      {sorted.length ? (
        <>
          <div className="db-materials-head">
            <span>Item</span>
            <span className="db-materials-head-num">Qty</span>
            <span className="db-materials-head-num">Rate</span>
            <span className="db-materials-head-num">Total</span>
            <span>Status</span>
            <span />
          </div>
          {sorted.map((m) => (
            <MaterialRow key={m.id} material={m} />
          ))}
        </>
      ) : (
        <div className="empty-note">No materials roughed out yet.</div>
      )}
      <AddMaterialForm detailId={detailId} />
    </Panel>
  );
}

function MaterialRow({ material: m }: { material: MaterialItem }) {
  const [, startTransition] = useTransition();
  const [addingLink, setAddingLink] = useState(false);
  const total = num(m.roughQuantity) * num(m.roughUnitCost);

  return (
    <div>
      <div className="db-materials-row">
        <input
          className="db-materials-cell-input"
          defaultValue={m.description}
          style={{ fontWeight: 500 }}
          onBlur={(e) => {
            if (e.target.value.trim() && e.target.value !== m.description) {
              startTransition(() => updateMaterial(m.id, { description: e.target.value.trim() }));
            }
          }}
        />
        <input
          type="number"
          min={0}
          step="any"
          title="Quantity"
          defaultValue={m.roughQuantity}
          className="db-materials-cell-input num"
          onBlur={(e) => startTransition(() => updateMaterial(m.id, { roughQuantity: e.target.value }))}
        />
        <input
          type="number"
          min={0}
          step="any"
          title="Unit cost"
          defaultValue={m.roughUnitCost}
          className="db-materials-cell-input num"
          onBlur={(e) => startTransition(() => updateMaterial(m.id, { roughUnitCost: e.target.value }))}
        />
        <span className="db-materials-cell-total">{money(total)}</span>
        <select
          className={`db-material-status ${m.status}`}
          defaultValue={m.status}
          onChange={(e) => startTransition(() => updateMaterial(m.id, { status: e.target.value }))}
        >
          {Object.entries(MSTATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <div className="db-materials-cell-status">
          <button className="icon-btn" onClick={() => startTransition(() => deleteMaterial(m.id))}>
            ✕
          </button>
        </div>
      </div>

      {m.productUrl ? (
        <div className="material-link-row">
          <a href={m.productUrl} target="_blank" rel="noopener noreferrer" className="material-link">
            🔗 {m.retailerName || retailerNameFromUrl(m.productUrl)}
          </a>
          <input
            className="material-retailer-input"
            defaultValue={m.retailerName || ""}
            placeholder="Rename retailer"
            onBlur={(e) => {
              if (e.target.value.trim() !== (m.retailerName || "")) {
                startTransition(() => updateMaterial(m.id, { retailerName: e.target.value.trim() || null }));
              }
            }}
          />
          <button
            className="db-materials-link-toggle"
            onClick={() => startTransition(() => updateMaterial(m.id, { productUrl: null, retailerName: null }))}
          >
            Remove
          </button>
        </div>
      ) : addingLink ? (
        <div className="db-materials-link-input-row">
          <input
            autoFocus
            placeholder="Paste a product URL"
            onBlur={(e) => {
              const value = e.target.value.trim();
              if (!value) {
                setAddingLink(false);
                return;
              }
              // Validated client-side first (sanitizeProductUrl is pure JS,
              // safe to call here) — updateMaterial is an async server
              // action, so a throw inside it rejects the returned promise
              // rather than throwing synchronously; validating before the
              // call lets this catch reach the user instead of becoming an
              // unhandled rejection.
              try {
                const sanitized = sanitizeProductUrl(value);
                startTransition(() => updateMaterial(m.id, { productUrl: sanitized }));
                setAddingLink(false);
              } catch (err) {
                alert(err instanceof Error ? err.message : "That link doesn't look valid.");
              }
            }}
          />
        </div>
      ) : (
        <button className="db-materials-link-toggle" onClick={() => setAddingLink(true)}>
          + product link
        </button>
      )}
    </div>
  );
}

function AddMaterialForm({ detailId }: { detailId: string }) {
  const [, startTransition] = useTransition();
  return (
    <form
      className="inline-add-form"
      style={{ marginTop: "var(--db-space-3)" }}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const desc = (form.elements.namedItem("desc") as HTMLInputElement).value;
        if (!desc.trim()) return;
        startTransition(() => addMaterial(detailId, desc, "1", "0"));
        form.reset();
      }}
    >
      <input name="desc" placeholder="Add an item — e.g. Grout, warm grey" />
      <button className="secondary" type="submit">
        Add
      </button>
    </form>
  );
}

function SpendPanel({ detailId, lines, estVal }: { detailId: string; lines: LineItem[]; estVal: number }) {
  const [, startTransition] = useTransition();
  const total = lines.reduce((sum, l) => sum + num(l.cost), 0);
  return (
    <Panel
      id="panel-spend"
      title={
        <div className="db-panel-title-row">
          <span>Actual spend</span>
          {lines.length ? <span className="db-panel-title-total">{money(total)}</span> : null}
        </div>
      }
    >
      {lines.length ? (
        lines.map((l) => (
          <div className="list-item" key={l.id}>
            {l.receiptAssetId ? <img className="receipt-thumb" src={`/asset/${l.receiptAssetId}`} alt="receipt" /> : null}
            <div className="list-item-main">
              <div className="db-spend-row-line">
                <input
                  className="db-spend-cell-input"
                  style={{ fontWeight: 500 }}
                  defaultValue={l.description}
                  onBlur={(e) => {
                    if (e.target.value.trim() && e.target.value !== l.description) {
                      startTransition(() => updateLineItem(l.id, { description: e.target.value.trim() }));
                    }
                  }}
                />
                <input
                  type="number"
                  min={0}
                  step="any"
                  className="db-spend-cell-input num"
                  defaultValue={l.cost}
                  onBlur={(e) => startTransition(() => updateLineItem(l.id, { cost: e.target.value }))}
                />
              </div>
              <div className="db-spend-row-line">
                <input
                  className="db-spend-cell-input vendor"
                  placeholder="Vendor"
                  defaultValue={l.vendor || ""}
                  onBlur={(e) => startTransition(() => updateLineItem(l.id, { vendor: e.target.value || null }))}
                />
                <input
                  type="date"
                  className="db-spend-cell-input date"
                  defaultValue={l.date || ""}
                  onBlur={(e) => startTransition(() => updateLineItem(l.id, { date: e.target.value }))}
                />
              </div>
            </div>
            <button className="icon-btn" onClick={() => startTransition(() => deleteLineItem(l.id))}>
              ✕
            </button>
          </div>
        ))
      ) : (
        <div className="empty-note">Nothing logged yet.</div>
      )}
      <AddLineItemForm detailId={detailId} />
      <div className="db-spend-footer">
        <span>Estimate</span>
        <span>{money(estVal)}</span>
      </div>
    </Panel>
  );
}

function AddLineItemForm({ detailId }: { detailId: string }) {
  const [, startTransition] = useTransition();
  return (
    <form
      className="inline-add-form"
      style={{ marginTop: "var(--db-space-3)" }}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const desc = (form.elements.namedItem("desc") as HTMLInputElement).value;
        const cost = (form.elements.namedItem("cost") as HTMLInputElement).value;
        if (!desc.trim()) return;
        startTransition(() => addLineItem(detailId, desc, cost, "", new Date().toISOString().slice(0, 10)));
        form.reset();
      }}
    >
      <input name="desc" placeholder="Log spend" />
      <input name="cost" type="number" min={0} step="any" placeholder="$" style={{ maxWidth: "6rem" }} />
      <button className="secondary" type="submit">
        Add
      </button>
    </form>
  );
}

// The checklist, redesigned as a numbered sequence — the "current step"
// (the first not-done item) is the one row worth full-strength ink; every
// other row, done or upcoming, sits a step lighter.
function SequencePanel({ detailId, items }: { detailId: string; items: ChecklistItem[] }) {
  const [, startTransition] = useTransition();
  const doneCount = items.filter((c) => c.done).length;
  const currentIndex = items.findIndex((c) => !c.done);
  return (
    <Panel title="The sequence">
      {items.length ? (
        items.map((c, i) => (
          <div
            key={c.id}
            className={`db-seq-row ${i === currentIndex ? "current" : ""} ${c.done ? "done" : ""}`}
          >
            <span className="db-seq-num">{String(i + 1).padStart(2, "0")}</span>
            <input
              type="checkbox"
              className="db-seq-check"
              defaultChecked={c.done}
              onChange={(e) => startTransition(() => toggleChecklistItem(c.id, e.target.checked))}
            />
            <div className="db-seq-main">
              <input
                className="db-seq-desc"
                defaultValue={c.description}
                onBlur={(e) => {
                  if (e.target.value.trim() && e.target.value !== c.description) {
                    startTransition(() => updateChecklistItem(c.id, { description: e.target.value.trim() }));
                  }
                }}
              />
              <input
                className="db-seq-note"
                placeholder="Note — dependency, lead time…"
                defaultValue={c.note || ""}
                onBlur={(e) => {
                  if (e.target.value !== (c.note || "")) {
                    startTransition(() => updateChecklistItem(c.id, { note: e.target.value || null }));
                  }
                }}
              />
            </div>
            <input
              className="db-seq-date"
              placeholder={c.done ? "done —" : "by —"}
              defaultValue={c.dueDate || ""}
              onBlur={(e) => {
                if (e.target.value !== (c.dueDate || "")) {
                  startTransition(() => updateChecklistItem(c.id, { dueDate: e.target.value || null }));
                }
              }}
            />
            <button className="icon-btn" onClick={() => startTransition(() => deleteChecklistItem(c.id))}>
              ✕
            </button>
          </div>
        ))
      ) : (
        <div className="empty-note">No steps yet.</div>
      )}
      <div className="db-seq-footer">
        <span>
          {doneCount} of {items.length} done
        </span>
        <form
          className="inline-add-form"
          style={{ marginTop: 0 }}
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const text = (form.elements.namedItem("text") as HTMLInputElement).value;
            if (!text.trim()) return;
            startTransition(() => addChecklistItem(detailId, text));
            form.reset();
          }}
        >
          <input name="text" placeholder="Add a step" style={{ width: "10rem" }} />
          <button className="link-btn" type="submit">
            + Add step
          </button>
        </form>
      </div>
    </Panel>
  );
}
