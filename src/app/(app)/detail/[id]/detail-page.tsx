"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { money, num } from "@/lib/format";
import { actualCost, estimatedSpendFor } from "@/lib/derived";
import { estimateCost } from "@/lib/cost-estimator";
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
import { ReferencesPanel } from "./references-panel";
import { NotesPanel } from "./notes-panel";
import { PalettePanel } from "./palette-panel";
import { ProgressPhotosPanel } from "./progress-photos-panel";
import { UnassignedReceiptItemsPanel } from "./unassigned-receipt-items-panel";
import type {
  details as detailsTable,
  houses as housesTable,
  rooms as roomsTable,
  materialItems as materialItemsTable,
  lineItems as lineItemsTable,
  checklistItems as checklistItemsTable,
  inboxItems as inboxItemsTable,
  boardImages as boardImagesTable,
  paletteSwatches as paletteSwatchesTable,
  progressPhotos as progressPhotosTable,
  receiptLineItems as receiptLineItemsTable,
} from "@/db/schema";

type Detail = typeof detailsTable.$inferSelect;
type House = typeof housesTable.$inferSelect;
type Room = typeof roomsTable.$inferSelect;
type MaterialItem = typeof materialItemsTable.$inferSelect;
type LineItem = typeof lineItemsTable.$inferSelect;
type ChecklistItem = typeof checklistItemsTable.$inferSelect;
type InboxItem = typeof inboxItemsTable.$inferSelect;
type BoardImage = typeof boardImagesTable.$inferSelect;
type Swatch = typeof paletteSwatchesTable.$inferSelect;
type ProgressPhoto = typeof progressPhotosTable.$inferSelect;
type ReceiptLineItem = typeof receiptLineItemsTable.$inferSelect;

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
  decided: "Decided",
  need_to_source: "Need to source",
  purchased: "Purchased",
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
  filedInbox,
  boardImages,
  paletteSwatches,
  progressPhotos,
  pendingReceiptItems,
  receiptDates,
  contentTypeByAssetId,
}: {
  detail: Detail;
  houses: House[];
  rooms: Room[];
  materialItems: MaterialItem[];
  lineItems: LineItem[];
  checklistItems: ChecklistItem[];
  filedInbox: InboxItem[];
  boardImages: BoardImage[];
  paletteSwatches: Swatch[];
  progressPhotos: ProgressPhoto[];
  pendingReceiptItems: ReceiptLineItem[];
  receiptDates: Record<string, string | null>;
  contentTypeByAssetId: Record<string, string | null>;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const overrideInputRef = useRef<HTMLInputElement>(null);
  const house = houses.find((h) => h.id === detail.houseId);
  const room = detail.roomId ? rooms.find((r) => r.id === detail.roomId) : null;
  const roomsOfHouse = rooms.filter((r) => r.houseId === detail.houseId);

  const actual = actualCost(lineItems, detail.id);
  const estVal = estimatedSpendFor(detail, materialItems);
  const doneCount = checklistItems.filter((c) => c.done).length;
  const ckPct = checklistItems.length ? Math.round((doneCount / checklistItems.length) * 100) : 0;
  const maxBar = Math.max(estVal, actual, 1);
  const estPct = Math.min(100, Math.round((estVal / maxBar) * 100));
  const actPct = Math.min(100, Math.round((actual / maxBar) * 100));
  const overBudget = estVal > 0 && actual > estVal;
  const statusColor = STATUS_COLOR[detail.status || "not_started"];

  return (
    <div className="detail-page">
      <div className="db-backbar">
        <button onClick={() => router.push("/houses")}>‹ Back</button>
      </div>

      <div className="db-hero" style={{ ["--status-color" as string]: statusColor }}>
        <div className="db-breadcrumb">
          {house ? house.name : ""}
          {room ? " / " + room.name : ""}
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

        <div className="db-hero-meta">
          <select
            className={`db-status-select status-${detail.status || "not_started"}`}
            defaultValue={detail.status || "not_started"}
            onChange={(e) => startTransition(() => updateDetail(detail.id, { status: e.target.value }))}
          >
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
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
        </div>

        <div className="db-budget">
          <div className="db-bar-row">
            <span className="db-bar-label">Estimated</span>
            <div className="db-bar-track">
              <div className="db-bar-fill" style={{ width: `${estPct}%`, background: "var(--accent-strong)" }} />
            </div>
            <span className="db-bar-value">{money(estVal)}</span>
          </div>
          <div className="db-bar-row">
            <span className="db-bar-label">Actual</span>
            <div className="db-bar-track">
              <div
                className="db-bar-fill"
                style={{ width: `${actPct}%`, background: overBudget ? "var(--danger)" : "var(--good)" }}
              />
            </div>
            <span className="db-bar-value">{money(actual)}</span>
          </div>
          <div className="db-bar-row" style={{ alignItems: "center" }}>
            <span className="db-bar-label">Override</span>
            <input
              ref={overrideInputRef}
              type="number"
              min={0}
              step="any"
              defaultValue={estVal}
              style={{ width: "7rem", padding: "0.25rem 0.5rem", fontWeight: 700 }}
              onBlur={(e) =>
                startTransition(() =>
                  updateDetail(detail.id, { estimatedSpend: e.target.value === "" ? null : e.target.value })
                )
              }
            />
            <button
              type="button"
              className="link-btn"
              style={{ fontSize: "0.72rem", textDecoration: "none" }}
              title="Fill in a rough ballpark cost based on the detail's name — a heuristic guess, not a quote"
              onClick={() => {
                const guess = estimateCost(detail.name);
                if (guess === null) {
                  alert(
                    `No rough estimate on file for "${detail.name}" yet — try a more common material/room keyword, or just enter a number by hand.`
                  );
                  return;
                }
                if (overrideInputRef.current) overrideInputRef.current.value = String(guess);
                startTransition(() => updateDetail(detail.id, { estimatedSpend: String(guess) }));
              }}
            >
              ✨ Estimate
            </button>
            <span
              className="db-bar-value"
              style={{ color: overBudget ? "var(--danger)" : "var(--text-muted)" }}
            >
              {overBudget ? "+" : ""}
              {money(actual - estVal)}
            </span>
          </div>
        </div>

        {checklistItems.length ? (
          <div className="db-checklist-progress-wrap">
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
              <span>Checklist</span>
              <span>
                {doneCount}/{checklistItems.length} done
              </span>
            </div>
            <div className="db-checklist-progress-track">
              <div className="db-checklist-progress-fill" style={{ width: `${ckPct}%` }} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="panel-grid">
        <MaterialsPanel detailId={detail.id} materials={materialItems} />
        <SpendPanel detailId={detail.id} lines={lineItems} />
        <ChecklistPanel detailId={detail.id} items={checklistItems} />

        <NotesPanel detailId={detail.id} notes={detail.notes} />

        <ReferencesPanel
          detailId={detail.id}
          images={boardImages}
          pinterestBoardUrl={detail.pinterestBoardUrl}
        />

        <PalettePanel detailId={detail.id} swatches={paletteSwatches} />

        <ProgressPhotosPanel detailId={detail.id} photos={progressPhotos} contentTypeByAssetId={contentTypeByAssetId} />

        <UnassignedReceiptItemsPanel detailId={detail.id} items={pendingReceiptItems} receiptDates={receiptDates} />

        {filedInbox.length ? (
          <div className="panel-card">
            <h4>📥 Captured here</h4>
            {filedInbox.map((it) => (
              <div className="list-item" key={it.id}>
                <div className="list-item-main">
                  {it.assetId ? (
                    (contentTypeByAssetId[it.assetId] || "").startsWith("video/") ? (
                      <video className="receipt-thumb" src={`/asset/${it.assetId}`} controls muted />
                    ) : (
                      <img className="receipt-thumb" src={`/asset/${it.assetId}`} alt="" />
                    )
                  ) : null}{" "}
                  {it.text}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="panel-card">
          <h4>📍 Move</h4>
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
        </div>

        <div className="panel-card span2" style={{ borderColor: "var(--danger-soft)" }}>
          <h4 style={{ color: "var(--danger)" }}>⚠️ Danger zone</h4>
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
        </div>
      </div>
    </div>
  );
}

function MaterialsPanel({ detailId, materials }: { detailId: string; materials: MaterialItem[] }) {
  const [, startTransition] = useTransition();
  return (
    <div className="panel-card">
      <h4>🧾 Materials plan</h4>
      {materials.length ? (
        materials.map((m) => {
          const total = num(m.roughQuantity) * num(m.roughUnitCost);
          return (
            <div className="list-item" key={m.id}>
              <div className="list-item-main">
                <input
                  defaultValue={m.description}
                  style={{ fontWeight: 600, padding: "0.15rem 0.3rem", marginBottom: "0.25rem" }}
                  onBlur={(e) => {
                    if (e.target.value.trim() && e.target.value !== m.description) {
                      startTransition(() => updateMaterial(m.id, { description: e.target.value.trim() }));
                    }
                  }}
                />
                <div className="list-item-sub" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    defaultValue={m.roughQuantity}
                    style={{ width: "4rem", padding: "0.15rem 0.3rem" }}
                    onBlur={(e) => startTransition(() => updateMaterial(m.id, { roughQuantity: e.target.value }))}
                  />
                  ×
                  <input
                    type="number"
                    min={0}
                    step="any"
                    defaultValue={m.roughUnitCost}
                    style={{ width: "5rem", padding: "0.15rem 0.3rem" }}
                    onBlur={(e) => startTransition(() => updateMaterial(m.id, { roughUnitCost: e.target.value }))}
                  />
                  = {money(total)}
                </div>
                <select
                  defaultValue={m.status}
                  style={{ marginTop: "0.3rem", fontSize: "0.76rem", padding: "0.2rem 0.4rem" }}
                  onChange={(e) => startTransition(() => updateMaterial(m.id, { status: e.target.value }))}
                >
                  {Object.entries(MSTATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <button className="icon-btn" onClick={() => startTransition(() => deleteMaterial(m.id))}>
                ✕
              </button>
            </div>
          );
        })
      ) : (
        <div className="empty-note">No materials roughed out yet.</div>
      )}
      <AddMaterialForm detailId={detailId} />
    </div>
  );
}

function AddMaterialForm({ detailId }: { detailId: string }) {
  const [, startTransition] = useTransition();
  return (
    <form
      className="inline-add-form"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const desc = (form.elements.namedItem("desc") as HTMLInputElement).value;
        const qty = (form.elements.namedItem("qty") as HTMLInputElement).value;
        const cost = (form.elements.namedItem("cost") as HTMLInputElement).value;
        if (!desc.trim()) return;
        startTransition(() => addMaterial(detailId, desc, qty, cost));
        form.reset();
      }}
    >
      <input name="desc" placeholder="Item" />
      <input name="qty" placeholder="Qty" style={{ maxWidth: "4.5rem" }} type="number" min={0} step="any" defaultValue={1} />
      <input name="cost" placeholder="Unit $" style={{ maxWidth: "6rem" }} type="number" min={0} step="any" />
      <button className="secondary" type="submit">
        Add
      </button>
    </form>
  );
}

function SpendPanel({ detailId, lines }: { detailId: string; lines: LineItem[] }) {
  const [, startTransition] = useTransition();
  return (
    <div className="panel-card">
      <h4>💳 Actual spend</h4>
      {lines.length ? (
        lines.map((l) => (
          <div className="list-item" key={l.id}>
            {l.receiptAssetId ? <img className="receipt-thumb" src={`/asset/${l.receiptAssetId}`} alt="receipt" /> : null}
            <div className="list-item-main">
              <input
                defaultValue={l.description}
                style={{ fontWeight: 600, padding: "0.1rem 0.3rem", marginBottom: "0.2rem" }}
                onBlur={(e) => {
                  if (e.target.value.trim() && e.target.value !== l.description) {
                    startTransition(() => updateLineItem(l.id, { description: e.target.value.trim() }));
                  }
                }}
              />
              <div className="list-item-sub" style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                $
                <input
                  type="number"
                  min={0}
                  step="any"
                  defaultValue={l.cost}
                  style={{ width: "5.5rem", padding: "0.1rem 0.3rem" }}
                  onBlur={(e) => startTransition(() => updateLineItem(l.id, { cost: e.target.value }))}
                />
                <input
                  defaultValue={l.vendor || ""}
                  placeholder="Vendor"
                  style={{ width: "6rem", padding: "0.1rem 0.3rem" }}
                  onBlur={(e) => startTransition(() => updateLineItem(l.id, { vendor: e.target.value || null }))}
                />
                <input
                  type="date"
                  defaultValue={l.date || ""}
                  style={{ padding: "0.1rem 0.3rem" }}
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
    </div>
  );
}

function AddLineItemForm({ detailId }: { detailId: string }) {
  const [, startTransition] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const desc = (form.elements.namedItem("desc") as HTMLInputElement).value;
        const cost = (form.elements.namedItem("cost") as HTMLInputElement).value;
        const vendor = (form.elements.namedItem("vendor") as HTMLInputElement).value;
        const date = (form.elements.namedItem("date") as HTMLInputElement).value;
        if (!desc.trim()) return;
        startTransition(() => addLineItem(detailId, desc, cost, vendor, date));
        form.reset();
      }}
    >
      <div className="inline-add-form">
        <input name="desc" placeholder="Description" />
        <input name="cost" placeholder="$" style={{ maxWidth: "6rem" }} type="number" min={0} step="any" />
      </div>
      <div className="inline-add-form">
        <input name="vendor" placeholder="Vendor (optional)" />
        <input name="date" type="date" style={{ maxWidth: "9.5rem" }} defaultValue={new Date().toISOString().slice(0, 10)} />
      </div>
      <div className="inline-add-form">
        <button className="secondary" type="submit">
          Log spend
        </button>
      </div>
    </form>
  );
}

function ChecklistPanel({ detailId, items }: { detailId: string; items: ChecklistItem[] }) {
  const [, startTransition] = useTransition();
  return (
    <div className="panel-card">
      <h4>✅ Checklist</h4>
      {items.length ? (
        items.map((c) => (
          <div className={`checklist-item ${c.done ? "done" : ""}`} key={c.id}>
            <input
              type="checkbox"
              defaultChecked={c.done}
              onChange={(e) => startTransition(() => toggleChecklistItem(c.id, e.target.checked))}
            />
            <input
              className="cl-text"
              defaultValue={c.description}
              style={{ flex: 1, fontSize: "0.85rem", border: "none", background: "transparent", padding: "0.15rem 0.3rem" }}
              onBlur={(e) => {
                if (e.target.value.trim() && e.target.value !== c.description) {
                  startTransition(() => updateChecklistItem(c.id, { description: e.target.value.trim() }));
                }
              }}
            />
            <button className="icon-btn" onClick={() => startTransition(() => deleteChecklistItem(c.id))}>
              ✕
            </button>
          </div>
        ))
      ) : (
        <div className="empty-note">No sub-steps yet.</div>
      )}
      <form
        className="inline-add-form"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const text = (form.elements.namedItem("text") as HTMLInputElement).value;
          if (!text.trim()) return;
          startTransition(() => addChecklistItem(detailId, text));
          form.reset();
        }}
      >
        <input name="text" placeholder="Add a step" />
        <button className="secondary" type="submit">
          Add
        </button>
      </form>
    </div>
  );
}
