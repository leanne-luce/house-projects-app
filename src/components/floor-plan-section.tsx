"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { Modal } from "@/components/modal";
import {
  addFloorPlan,
  updateFloorPlan,
  deleteFloorPlan,
  attachFloorPlanToDetail,
  detachFloorPlanFromDetail,
  attachFloorPlanToHouse,
  detachFloorPlanFromHouse,
} from "@/lib/actions";
import type { floorPlanDetailLinks as floorPlanDetailLinksTable, floorPlanHouseLinks as floorPlanHouseLinksTable } from "@/db/schema";
import type { FloorPlanWithContext } from "@/lib/derived";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

type FloorPlan = FloorPlanWithContext;
type FloorPlanDetailLink = typeof floorPlanDetailLinksTable.$inferSelect;
type FloorPlanHouseLink = typeof floorPlanHouseLinksTable.$inferSelect;
type Owner = { type: "house" | "detail"; id: string };

// Scene data round-trips through jsonb opaque to the rest of the app — this
// only ever narrows it enough to hand back to Excalidraw's own initialData/
// export shape, never reads inside it otherwise.
type SceneData = { elements?: unknown; appState?: { viewBackgroundColor?: string }; files?: unknown };

// Excalidraw touches window/document at module-eval time, so it can only
// ever run client-side — dynamic import with ssr:false is what keeps this
// from breaking the server render of whichever page embeds this (Houses,
// Detail). exportToSvg (used for the card previews below) has the same
// constraint but isn't a component next/dynamic can wrap, so that one's
// loaded with a plain lazy `import()` inside an effect instead — never
// evaluated during SSR either way, just via a different mechanism.
const Excalidraw = dynamic(async () => (await import("@excalidraw/excalidraw")).Excalidraw, {
  ssr: false,
  loading: () => <div className="empty-note">Loading canvas…</div>,
});

// No title/heading here on purpose — the Houses page wants this under a
// .room-group-title next to Color Palette, the Detail page wants it inside
// a <Panel>. Each caller supplies its own wrapper; this is just the grid +
// add/attach buttons + editor modal.
//
// A house and a detail each keep their OWN collection (floorPlans.houseId/
// detailId — set once, at creation, never reassigned) rather than sharing
// one pool; "Attach sketch" is how an existing sketch from anywhere else
// (another detail, another house) shows up here too, via the join tables,
// without moving or duplicating it.
export function FloorPlanSection({
  ownerType,
  ownerId,
  allFloorPlans,
  detailLinks,
  houseLinks,
}: {
  ownerType: "house" | "detail";
  ownerId: string;
  allFloorPlans: FloorPlan[];
  detailLinks: FloorPlanDetailLink[];
  houseLinks: FloorPlanHouseLink[];
}) {
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<FloorPlan | null>(null);
  const [creating, setCreating] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const owner: Owner = { type: ownerType, id: ownerId };

  const ownFloorPlans =
    ownerType === "house"
      ? allFloorPlans.filter((f) => f.houseId === ownerId && !f.detailId)
      : allFloorPlans.filter((f) => f.detailId === ownerId);

  const relevantLinks =
    ownerType === "house" ? houseLinks.filter((l) => l.houseId === ownerId) : detailLinks.filter((l) => l.detailId === ownerId);
  const attached = relevantLinks
    .map((l) => ({ linkId: l.id, floorPlan: allFloorPlans.find((f) => f.id === l.floorPlanId) }))
    .filter((a): a is { linkId: string; floorPlan: FloorPlan } => Boolean(a.floorPlan));

  const shownIds = new Set([...ownFloorPlans.map((f) => f.id), ...attached.map((a) => a.floorPlan.id)]);
  const pickable = allFloorPlans.filter((f) => !shownIds.has(f.id));

  async function handleAddNew() {
    setCreating(true);
    const row = await addFloorPlan(ownerType === "house" ? { houseId: ownerId } : { detailId: ownerId }, "Untitled sketch");
    setCreating(false);
    if (row) setEditing({ ...row, houseName: "", detailName: null });
  }

  function handleDetach(linkId: string) {
    startTransition(() => (ownerType === "house" ? detachFloorPlanFromHouse(linkId) : detachFloorPlanFromDetail(linkId)));
  }

  function handleDeleteOwned(f: FloorPlan) {
    if (confirm(`Delete "${f.name}"? This can't be undone.`)) {
      startTransition(() => deleteFloorPlan(f.id));
    }
  }

  return (
    <>
      {ownFloorPlans.length || attached.length ? (
        <div className="floor-plan-grid">
          {ownFloorPlans.map((f) => (
            <FloorPlanCard key={f.id} floorPlan={f} onOpen={() => setEditing(f)} onRemove={() => handleDeleteOwned(f)} />
          ))}
          {attached.map(({ linkId, floorPlan: f }) => (
            <FloorPlanCard
              key={linkId}
              floorPlan={f}
              attachedFrom={f.detailName ? `${f.houseName} — ${f.detailName}` : f.houseName}
              onOpen={() => setEditing(f)}
              onRemove={() => handleDetach(linkId)}
              removeTitle="Detach sketch"
            />
          ))}
        </div>
      ) : (
        <div className="empty-note">No floor plans or sketches yet.</div>
      )}
      <div className="add-row-btns">
        <button className="ghost" onClick={handleAddNew} disabled={creating}>
          {creating ? "Creating…" : "+ Add sketch"}
        </button>
        {pickable.length ? (
          <button className="ghost" onClick={() => setAttaching(true)}>
            + Attach sketch
          </button>
        ) : null}
      </div>

      {editing ? <FloorPlanEditor floorPlan={editing} onClose={() => setEditing(null)} /> : null}
      {attaching ? (
        <AttachSketchModal
          owner={owner}
          pickable={pickable}
          onClose={() => setAttaching(false)}
        />
      ) : null}
    </>
  );
}

function FloorPlanCard({
  floorPlan,
  attachedFrom,
  onOpen,
  onRemove,
  removeTitle = "Delete sketch",
}: {
  floorPlan: FloorPlan;
  attachedFrom?: string;
  onOpen: () => void;
  onRemove: () => void;
  removeTitle?: string;
}) {
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const scene = (floorPlan.sceneData as SceneData | null) || null;
  const elements = (scene?.elements as unknown[]) || [];

  useEffect(() => {
    if (!elements.length) return;
    let cancelled = false;
    (async () => {
      const { exportToSvg } = await import("@excalidraw/excalidraw");
      const svg = await exportToSvg({
        elements: elements as never,
        appState: scene?.appState || {},
        files: (scene?.files as never) || null,
        exportPadding: 8,
      });
      if (!cancelled) setSvgHtml(svg.outerHTML);
    })();
    return () => {
      cancelled = true;
    };
    // Re-render the preview only when the sketch itself changes, not on
    // every parent re-render — `elements` is a fresh array reference each
    // render otherwise, which would re-export on every unrelated update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floorPlan.id, floorPlan.sceneData]);

  return (
    <div className="floor-plan-card" onClick={onOpen}>
      <div className="floor-plan-card-preview">
        {svgHtml ? (
          <div className="floor-plan-card-svg" dangerouslySetInnerHTML={{ __html: svgHtml }} />
        ) : (
          <div className="floor-plan-card-icon">✎</div>
        )}
      </div>
      <div className="floor-plan-card-name">{floorPlan.name}</div>
      {attachedFrom ? <div className="floor-plan-card-source">from {attachedFrom}</div> : null}
      <button
        className="icon-btn floor-plan-card-delete"
        title={removeTitle}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        ✕
      </button>
    </div>
  );
}

function AttachSketchModal({
  owner,
  pickable,
  onClose,
}: {
  owner: Owner;
  pickable: FloorPlan[];
  onClose: () => void;
}) {
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState("");

  return (
    <Modal title="Attach a sketch" onClose={onClose}>
      <p className="scratchpad-help" style={{ marginBottom: "0.8rem" }}>
        Pick a floor plan or sketch already created elsewhere — it stays where it is, this just also shows it
        here.
      </p>
      <div className="field">
        <label className="field-label">Sketch</label>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} autoFocus>
          <option value="" disabled>
            Select a sketch…
          </option>
          {pickable.map((f) => (
            <option key={f.id} value={f.id}>
              {f.detailName ? `${f.houseName} — ${f.detailName}` : f.houseName} — {f.name}
            </option>
          ))}
        </select>
      </div>
      <button
        className="primary"
        disabled={!selected}
        onClick={() => {
          startTransition(() =>
            owner.type === "house" ? attachFloorPlanToHouse(selected, owner.id) : attachFloorPlanToDetail(selected, owner.id)
          );
          onClose();
        }}
      >
        Attach
      </button>
    </Modal>
  );
}

function FloorPlanEditor({ floorPlan, onClose }: { floorPlan: FloorPlan; onClose: () => void }) {
  const [name, setName] = useState(floorPlan.name);
  const [saving, setSaving] = useState(false);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const scene = (floorPlan.sceneData as SceneData | null) || null;

  async function handleSave() {
    const api = apiRef.current;
    if (!api) return;
    setSaving(true);
    const elements = api.getSceneElements();
    const appState = api.getAppState();
    const files = api.getFiles();
    await updateFloorPlan(floorPlan.id, {
      name: name.trim() || "Untitled sketch",
      // Only the background color is worth keeping from appState — the
      // rest (active tool, selection, collaborators…) is per-session UI
      // state that shouldn't be "restored" the next time this is opened.
      sceneData: { elements, appState: { viewBackgroundColor: appState.viewBackgroundColor }, files },
    });
    setSaving(false);
    onClose();
  }

  // Nothing here auto-saves, so closing without warning (Escape, backdrop
  // click, the × button — Modal funnels all three through this one
  // handler) used to silently throw away whatever was just drawn. Asking
  // first is what actually fixes that, not just remembering to hit Save.
  function handleRequestClose() {
    if (confirm("Save your changes before closing?")) {
      handleSave();
    }
  }

  return (
    <Modal title="Floor plan & sketches" onClose={handleRequestClose} size="large">
      <div className="floor-plan-editor">
        <div className="floor-plan-editor-toolbar">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sketch name"
            className="floor-plan-name-input"
          />
          <button className="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
        <div className="floor-plan-canvas-wrap">
          <Excalidraw
            excalidrawAPI={(api) => {
              apiRef.current = api;
            }}
            initialData={{
              elements: scene?.elements as never,
              appState: scene?.appState,
              files: scene?.files as never,
            }}
          />
        </div>
      </div>
    </Modal>
  );
}
