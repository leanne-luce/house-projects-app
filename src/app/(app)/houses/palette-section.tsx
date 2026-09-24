"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/modal";
import { addPaletteColor, updatePaletteColor, deletePaletteColor } from "@/lib/actions";
import { PAINT_FINISH_VALUES } from "@/db/schema";
import type { housePaletteColors as housePaletteColorsTable, detailPaletteColors as detailPaletteColorsTable, details as detailsTable } from "@/db/schema";

type PaletteColor = typeof housePaletteColorsTable.$inferSelect;
type DetailPaletteColorLink = typeof detailPaletteColorsTable.$inferSelect;
type Detail = typeof detailsTable.$inferSelect;
type PaintFinish = (typeof PAINT_FINISH_VALUES)[number];

const FINISH_LABEL: Record<PaintFinish, string> = {
  flat: "Flat",
  matte: "Matte",
  eggshell: "Eggshell",
  satin: "Satin",
  "semi-gloss": "Semi-gloss",
  gloss: "Gloss",
};

export function PaletteSection({
  houseId,
  colors,
  colorLinks,
  details,
}: {
  houseId: string;
  colors: PaletteColor[];
  colorLinks: DetailPaletteColorLink[];
  details: Detail[];
}) {
  const [, startTransition] = useTransition();
  const [modalState, setModalState] = useState<{ mode: "add" } | { mode: "edit"; color: PaletteColor } | null>(null);

  function handleDelete(c: PaletteColor) {
    const usedBy = colorLinks
      .filter((l) => l.paletteColorId === c.id)
      .map((l) => details.find((d) => d.id === l.detailId)?.name)
      .filter((name): name is string => Boolean(name));

    const message = usedBy.length
      ? `"${c.name}" is used on ${usedBy.length} detail${usedBy.length === 1 ? "" : "s"}: ${usedBy.join(", ")}.\n\nDelete it anyway? Those links will be removed too.`
      : `Delete "${c.name}" from this palette?`;

    if (confirm(message)) {
      startTransition(() => deletePaletteColor(c.id));
    }
  }

  return (
    <div className="room-group">
      <div className="room-group-title">Color Palette</div>
      {colors.length ? (
        <div className="palette-color-grid">
          {colors.map((c) => {
            const usageCount = colorLinks.filter((l) => l.paletteColorId === c.id).length;
            return (
              <div className="palette-color-card" key={c.id}>
                <div className="palette-color-swatch" style={{ background: c.hex }} />
                <div className="palette-color-body">
                  <div className="palette-color-name">{c.name}</div>
                  {c.brand || c.colorCode ? (
                    <div className="palette-color-meta">{[c.brand, c.colorCode].filter(Boolean).join(" · ")}</div>
                  ) : null}
                  <span className="palette-color-finish">{FINISH_LABEL[c.finish as PaintFinish] || c.finish}</span>
                  {c.whereUsed ? <div className="palette-color-where">{c.whereUsed}</div> : null}
                  {usageCount ? (
                    <div className="palette-color-usage">
                      Used in {usageCount} detail{usageCount === 1 ? "" : "s"}
                    </div>
                  ) : null}
                  <div className="palette-color-actions">
                    <button className="link-btn" onClick={() => setModalState({ mode: "edit", color: c })}>
                      Edit
                    </button>
                    <button className="icon-btn" title="Delete color" onClick={() => handleDelete(c)}>
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-note">No colors logged yet.</div>
      )}
      <div className="add-row-btns">
        <button className="ghost" onClick={() => setModalState({ mode: "add" })}>
          + Add color
        </button>
      </div>

      {modalState ? (
        <PaletteColorModal
          houseId={houseId}
          existing={modalState.mode === "edit" ? modalState.color : undefined}
          onClose={() => setModalState(null)}
        />
      ) : null}
    </div>
  );
}

function PaletteColorModal({
  houseId,
  existing,
  onClose,
}: {
  houseId: string;
  existing?: PaletteColor;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [hex, setHex] = useState(existing?.hex || "#9D8B5E");

  return (
    <Modal title={existing ? `Edit color — ${existing.name}` : "Add a color"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const input = {
            name: (form.elements.namedItem("name") as HTMLInputElement).value,
            hex,
            brand: (form.elements.namedItem("brand") as HTMLInputElement).value,
            colorCode: (form.elements.namedItem("colorCode") as HTMLInputElement).value,
            finish: (form.elements.namedItem("finish") as HTMLSelectElement).value as PaintFinish,
            whereUsed: (form.elements.namedItem("whereUsed") as HTMLInputElement).value,
            notes: (form.elements.namedItem("notes") as HTMLTextAreaElement).value,
          };
          startTransition(async () => {
            try {
              if (existing) {
                await updatePaletteColor(existing.id, input);
              } else {
                await addPaletteColor(houseId, input);
              }
              onClose();
            } catch (err) {
              alert(err instanceof Error ? err.message : "Couldn't save that color.");
            }
          });
        }}
      >
        <div className="field">
          <label className="field-label">Name</label>
          <input name="name" defaultValue={existing?.name} placeholder="e.g. Swiss Coffee" autoFocus />
        </div>
        <div className="field">
          <label className="field-label">Color</label>
          <div className="palette-hex-row">
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="palette-hex-swatch-input"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              placeholder="#RRGGBB"
              style={{ flex: 1 }}
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label className="field-label">Brand</label>
            <input name="brand" defaultValue={existing?.brand || ""} placeholder="e.g. Benjamin Moore" />
          </div>
          <div className="field">
            <label className="field-label">Color code</label>
            <input name="colorCode" defaultValue={existing?.colorCode || ""} placeholder="e.g. OC-45" />
          </div>
        </div>
        <div className="field">
          <label className="field-label">Finish</label>
          <select name="finish" defaultValue={existing?.finish || "flat"}>
            {PAINT_FINISH_VALUES.map((f) => (
              <option key={f} value={f}>
                {FINISH_LABEL[f]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Where it's used</label>
          <input
            name="whereUsed"
            defaultValue={existing?.whereUsed || ""}
            placeholder="e.g. Trim, all interior doors"
          />
        </div>
        <div className="field">
          <label className="field-label">Notes</label>
          <textarea name="notes" defaultValue={existing?.notes || ""} rows={2} />
        </div>
        <button className="primary" type="submit" disabled={pending}>
          {pending ? "Saving…" : existing ? "Save changes" : "Add color"}
        </button>
      </form>
    </Modal>
  );
}
