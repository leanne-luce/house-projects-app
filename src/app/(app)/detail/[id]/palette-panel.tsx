"use client";

import { useRef, useTransition } from "react";
import { addSwatch, updateSwatch, deleteSwatch } from "@/lib/actions";
import { Panel } from "@/components/panel";
import type { paletteSwatches as paletteSwatchesTable } from "@/db/schema";

type Swatch = typeof paletteSwatchesTable.$inferSelect;

export function PalettePanel({ detailId, swatches }: { detailId: string; swatches: Swatch[] }) {
  const [, startTransition] = useTransition();
  const colorRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLInputElement>(null);

  return (
    <Panel title="Color palette">
      <div className="swatch-row">
        {swatches.length ? (
          swatches.map((s) => (
            <div className="swatch-item" key={s.id}>
              <input
                type="color"
                className="sw-color"
                defaultValue={s.hex || "#9D8B5E"}
                onChange={(e) => startTransition(() => updateSwatch(s.id, { hex: e.target.value }))}
              />
              <input
                className="sw-label"
                defaultValue={s.label || ""}
                placeholder="Label"
                onBlur={(e) => startTransition(() => updateSwatch(s.id, { label: e.target.value }))}
              />
              <button className="icon-btn" onClick={() => startTransition(() => deleteSwatch(s.id))}>
                ✕
              </button>
            </div>
          ))
        ) : (
          <div className="empty-note">No colors picked yet.</div>
        )}
      </div>
      <div className="inline-add-form">
        <input type="color" ref={colorRef} defaultValue="#9D8B5E" style={{ maxWidth: "3rem", padding: "0.2rem" }} />
        <input ref={labelRef} placeholder="Label (e.g. Trim)" />
        <button
          className="secondary"
          onClick={() => {
            const hex = colorRef.current?.value || "#9D8B5E";
            const label = labelRef.current?.value || "";
            startTransition(() => addSwatch(detailId, hex, label));
            if (labelRef.current) labelRef.current.value = "";
          }}
        >
          Add
        </button>
      </div>
    </Panel>
  );
}
