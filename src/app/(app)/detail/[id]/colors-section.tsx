"use client";

import { useTransition } from "react";
import { Panel } from "@/components/panel";
import { linkPaletteColorToDetail, updateDetailPaletteColorRole, unlinkPaletteColorFromDetail } from "@/lib/actions";
import { PAINT_FINISH_VALUES } from "@/db/schema";
import type { housePaletteColors as housePaletteColorsTable, detailPaletteColors as detailPaletteColorsTable } from "@/db/schema";

type PaletteColor = typeof housePaletteColorsTable.$inferSelect;
type DetailPaletteColorLink = typeof detailPaletteColorsTable.$inferSelect;
type PaintFinish = (typeof PAINT_FINISH_VALUES)[number];

const FINISH_LABEL: Record<PaintFinish, string> = {
  flat: "Flat",
  matte: "Matte",
  eggshell: "Eggshell",
  satin: "Satin",
  "semi-gloss": "Semi-gloss",
  gloss: "Gloss",
};

// A detail can link the same house color more than once (walls + trim, say)
// — the picker always offers every house color, not just the unlinked ones.
export function ColorsSection({
  detailId,
  houseColors,
  links,
}: {
  detailId: string;
  houseColors: PaletteColor[];
  links: DetailPaletteColorLink[];
}) {
  const [, startTransition] = useTransition();

  return (
    <Panel title="Colors">
      {links.length ? (
        <div className="palette-color-grid">
          {links.map((link) => {
            const color = houseColors.find((c) => c.id === link.paletteColorId);
            if (!color) return null;
            return (
              <div className="palette-color-card" key={link.id}>
                <div className="palette-color-swatch" style={{ background: color.hex }} />
                <div className="palette-color-body">
                  <div className="palette-color-name">{color.name}</div>
                  {color.brand || color.colorCode ? (
                    <div className="palette-color-meta">
                      {[color.brand, color.colorCode].filter(Boolean).join(" · ")}
                    </div>
                  ) : null}
                  <span className="palette-color-finish">{FINISH_LABEL[color.finish as PaintFinish] || color.finish}</span>
                  <input
                    className="color-role-input"
                    defaultValue={link.role || ""}
                    placeholder="Role — walls, trim, ceiling…"
                    onBlur={(e) => {
                      if (e.target.value !== (link.role || "")) {
                        startTransition(() => updateDetailPaletteColorRole(link.id, e.target.value));
                      }
                    }}
                  />
                  <div className="palette-color-actions">
                    <button
                      className="icon-btn"
                      title="Remove this color from the detail"
                      onClick={() => startTransition(() => unlinkPaletteColorFromDetail(link.id))}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-note">No colors linked yet.</div>
      )}

      {houseColors.length ? (
        <>
          <div className="color-picker-label">Add from this house's palette</div>
          <div className="color-picker-row">
            {houseColors.map((c) => (
              <button
                key={c.id}
                type="button"
                className="color-picker-chip"
                title={`Add ${c.name}`}
                onClick={() =>
                  startTransition(() => {
                    linkPaletteColorToDetail(detailId, c.id);
                  })
                }
              >
                <span className="color-picker-swatch" style={{ background: c.hex }} />
                {c.name}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-note">
          No colors logged for this house yet — add some on the House page's Color Palette section first.
        </div>
      )}
    </Panel>
  );
}
