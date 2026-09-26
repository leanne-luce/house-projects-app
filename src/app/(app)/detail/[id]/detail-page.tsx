"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { money, num } from "@/lib/format";
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
import { ColorsSection } from "./colors-section";
import { ProgressPhotosPanel } from "./progress-photos-panel";
import { ScratchpadPanel } from "./scratchpad-panel";
import type {
  details as detailsTable,
  houses as housesTable,
  rooms as roomsTable,
  materialItems as materialItemsTable,
  lineItems as lineItemsTable,
  checklistItems as checklistItemsTable,
  boardImages as boardImagesTable,
  progressPhotos as progressPhotosTable,
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
type ProgressPhoto = typeof progressPhotosTable.$inferSelect;
type PaletteColor = typeof housePaletteColorsTable.$inferSelect;
type DetailPaletteColorLink = typeof detailPaletteColorsTable.$inferSelect;

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
  on_hold: "On hold",
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

export function DetailPageClient({
  detail,
  houses,
  rooms,
  materialItems,
  lineItems,
  checklistItems,
  boardImages,
  progressPhotos,
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
  progressPhotos: ProgressPhoto[];
  contentTypeByAssetId: Record<string, string | null>;
  housePaletteColors: PaletteColor[];
  detailPaletteColors: DetailPaletteColorLink[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const house = houses.find((h) => h.id === detail.houseId);
  const room = detail.roomId ? rooms.find((r) => r.id === detail.roomId) : null;
  const roomsOfHouse = rooms.filter((r) => r.houseId === detail.houseId);

  const statusColor = STATUS_COLOR[detail.status || "not_started"];
  const backTarget = room ? room.name : house ? house.name : "Houses";
  const deliveryMonth = detail.timeframeGranularity === "month" ? detail.timeframeValue || "" : "";

  return (
    <div className="detail-page">
      <div className="db-backbar">
        <button onClick={() => router.push("/houses")}>← {backTarget}</button>
      </div>

      {/* Header card — name, status, estimated delivery. */}
      <div className="db-hero" style={{ ["--status-color" as string]: statusColor }}>
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

        {/* One line, read like a sentence — status, delivery, furniture flag
            — rather than a row of separate form controls. Every piece is
            still a real editable input/select, just styled to blend into
            the surrounding text until hovered or focused. */}
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
          <input
            type="month"
            defaultValue={deliveryMonth}
            title="Estimated delivery"
            onBlur={(e) => {
              if (e.target.value !== deliveryMonth) {
                startTransition(() =>
                  updateDetail(detail.id, { timeframeGranularity: "month", timeframeValue: e.target.value || null })
                );
              }
            }}
          />
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

      {/* Vibe — the visual direction: mood board/references and the
          detail's linked paint colors, side by side at tablet+ width. */}
      <section className="db-section">
        <h2 className="db-section-title">Vibe</h2>
        <div className="panel-grid">
          <ReferencesPanel
            detailId={detail.id}
            houseId={detail.houseId}
            images={boardImages}
            pinterestBoardUrl={detail.pinterestBoardUrl}
          />
          <ColorsSection detailId={detail.id} houseColors={housePaletteColors} links={detailPaletteColors} />
        </div>
      </section>

      {/* Project — the actual work: what happens in order, what it takes,
          and a scratch space for the math behind it. */}
      <section className="db-section">
        <h2 className="db-section-title">Project</h2>
        <div className="db-stack">
          <SequencePanel detailId={detail.id} items={checklistItems} />
          <MaterialsPanel detailId={detail.id} materials={materialItems} lines={lineItems} />
          <ScratchpadPanel detailId={detail.id} initialValue={detail.scratchpad || ""} />
        </div>
      </section>

      {/* Progress */}
      <section className="db-section">
        <h2 className="db-section-title">Progress</h2>
        <ProgressPhotosPanel
          detailId={detail.id}
          houseId={detail.houseId}
          photos={progressPhotos}
          contentTypeByAssetId={contentTypeByAssetId}
        />
      </section>

      {/* Actions footer — quiet by design; deleting is a real action but
          doesn't need a large red card shouting about it. */}
      <div className="db-actions-footer">
        <div className="db-actions-move">
          <span className="db-actions-label">Move to</span>
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
        <button
          className="db-actions-delete"
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
  );
}

// Sorted roughly by how urgently each material needs attention — not
// tracked lead times, but a reasonable stand-in with the data on hand.
const MATERIAL_URGENCY: Record<string, number> = { need_to_source: 0, decided: 1, idea: 2, purchased: 3 };

function MaterialsPanel({
  detailId,
  materials,
  lines,
}: {
  detailId: string;
  materials: MaterialItem[];
  lines: LineItem[];
}) {
  const sorted = [...materials].sort(
    (a, b) => (MATERIAL_URGENCY[a.status] ?? 9) - (MATERIAL_URGENCY[b.status] ?? 9)
  );
  const planned = sorted.reduce((sum, m) => sum + num(m.roughQuantity) * num(m.roughUnitCost), 0);
  const linkedActual = lines.filter((l) => l.materialId).reduce((sum, l) => sum + num(l.cost), 0);
  return (
    <Panel
      title={
        <div className="db-panel-title-row">
          <span>Materials plan</span>
          {sorted.length ? (
            <span className="db-panel-title-total">
              Est {money(planned)} · Actual {money(linkedActual)}
            </span>
          ) : null}
        </div>
      }
    >
      {sorted.length ? (
        sorted.map((m, i) => (
          <MaterialRow key={m.id} index={i} material={m} lines={lines.filter((l) => l.materialId === m.id)} />
        ))
      ) : (
        <div className="empty-note">No materials roughed out yet.</div>
      )}
      <AddMaterialForm detailId={detailId} />
    </Panel>
  );
}

// Styled like SequencePanel's rows below (same .db-seq-* classes) — a
// numbered list rather than a spreadsheet table. The "note" slot under the
// description is used for the Qty × Rate = Est · Actual comparison instead
// of freeform text, and any spend logged against this material (via
// lineItems.materialId) shows as its own compact sub-list.
function MaterialRow({ index, material: m, lines }: { index: number; material: MaterialItem; lines: LineItem[] }) {
  const [, startTransition] = useTransition();
  const [addingLink, setAddingLink] = useState(false);
  const [addingSpend, setAddingSpend] = useState(false);
  const est = num(m.roughQuantity) * num(m.roughUnitCost);
  const actual = lines.reduce((sum, l) => sum + num(l.cost), 0);
  const over = est > 0 && actual > est;

  return (
    <div className="db-seq-row">
      <span className="db-seq-num">{String(index + 1).padStart(2, "0")}</span>
      <div className="db-seq-main">
        <input
          className="db-seq-desc"
          defaultValue={m.description}
          onBlur={(e) => {
            if (e.target.value.trim() && e.target.value !== m.description) {
              startTransition(() => updateMaterial(m.id, { description: e.target.value.trim() }));
            }
          }}
        />
        <div className="db-material-compare">
          <input
            type="number"
            min={0}
            step="any"
            title="Quantity"
            defaultValue={m.roughQuantity}
            className="db-material-compare-input"
            onBlur={(e) => startTransition(() => updateMaterial(m.id, { roughQuantity: e.target.value }))}
          />
          <span>×</span>
          <span>$</span>
          <input
            type="number"
            min={0}
            step="any"
            title="Unit cost"
            defaultValue={m.roughUnitCost}
            className="db-material-compare-input"
            onBlur={(e) => startTransition(() => updateMaterial(m.id, { roughUnitCost: e.target.value }))}
          />
          <span className="db-material-est-actual">
            <span className="db-material-sep">·</span>
            <span>Est {money(est)}</span>
            <span className="db-material-sep">·</span>
            <span className={`db-material-actual${over ? " over" : ""}`}>Actual {money(actual)}</span>
          </span>
        </div>

        {lines.length ? (
          <div className="db-material-spend-list">
            {lines.map((l) => (
              <div className="db-material-spend-row" key={l.id}>
                <input
                  className="db-material-spend-input"
                  placeholder="Vendor"
                  defaultValue={l.vendor || ""}
                  onBlur={(e) => startTransition(() => updateLineItem(l.id, { vendor: e.target.value || null }))}
                />
                <input
                  type="date"
                  className="db-material-spend-input"
                  defaultValue={l.date || ""}
                  onBlur={(e) => startTransition(() => updateLineItem(l.id, { date: e.target.value }))}
                />
                <input
                  type="number"
                  min={0}
                  step="any"
                  className="db-material-spend-input num"
                  defaultValue={l.cost}
                  onBlur={(e) => startTransition(() => updateLineItem(l.id, { cost: e.target.value }))}
                />
                <button className="icon-btn" onClick={() => startTransition(() => deleteLineItem(l.id))}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {addingSpend ? (
          <form
            className="db-material-spend-add-row"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const cost = (form.elements.namedItem("cost") as HTMLInputElement).value;
              const vendor = (form.elements.namedItem("vendor") as HTMLInputElement).value;
              if (!cost) return;
              startTransition(() =>
                addLineItem(m.detailId, m.description, cost, vendor, new Date().toISOString().slice(0, 10), m.id)
              );
              setAddingSpend(false);
            }}
          >
            <input name="vendor" placeholder="Vendor (optional)" autoFocus />
            <input name="cost" type="number" min={0} step="any" placeholder="$" style={{ maxWidth: "6rem" }} />
            <button className="secondary" type="submit">
              Add
            </button>
          </form>
        ) : (
          <button className="db-materials-link-toggle" onClick={() => setAddingSpend(true)}>
            + log spend
          </button>
        )}

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
                // Validated client-side first (sanitizeProductUrl is pure
                // JS, safe to call here) — updateMaterial is an async
                // server action, so a throw inside it rejects the returned
                // promise rather than throwing synchronously; validating
                // before the call lets this catch reach the user instead of
                // becoming an unhandled rejection.
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
      <button className="icon-btn" onClick={() => startTransition(() => deleteMaterial(m.id))}>
        ✕
      </button>
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
