"use client";

import { useRef, useState, useTransition } from "react";
import { compressImage } from "@/lib/compress-image";
import { addBoardImage, updateBoardImage, deleteBoardImage, updateDetail } from "@/lib/actions";
import { previewPinterestBoard } from "@/lib/pinterest";
import { PhotoPickerButton } from "@/components/photo-picker-button";
import type { boardImages as boardImagesTable } from "@/db/schema";

type BoardImage = typeof boardImagesTable.$inferSelect;
type BoardType = "mood" | "reference";

type PinterestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; images: string[]; selected: Set<string>; note?: string };

// Mood board and Reference & assembly are merged into one visual section —
// they share the same image-collection mechanic, and per-image type is now
// a property you set/change on each image rather than two separate grids.

export function ReferencesPanel({
  detailId,
  images,
  pinterestBoardUrl,
}: {
  detailId: string;
  images: BoardImage[];
  pinterestBoardUrl?: string | null;
}) {
  const [, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);

  const [pinterestState, setPinterestState] = useState<PinterestState>({ status: "idle" });
  const [importType, setImportType] = useState<BoardType>("mood");
  const [importing, setImporting] = useState(false);

  async function handleAdd() {
    const sourceUrl = urlRef.current?.value || "";
    const boardType = (typeRef.current?.value as BoardType) || "mood";
    if (!pendingFile && !sourceUrl.trim()) return;

    setUploading(true);
    const formData = new FormData();
    formData.set("detailId", detailId);
    formData.set("boardType", boardType);
    formData.set("sourceUrl", sourceUrl);
    if (pendingFile) formData.set("file", await compressImage(pendingFile));
    await addBoardImage(formData);
    setUploading(false);
    setPendingFile(null);
    if (urlRef.current) urlRef.current.value = "";
  }

  async function handlePullFromPinterest() {
    if (!pinterestBoardUrl) return;
    setPinterestState({ status: "loading" });
    const result = await previewPinterestBoard(pinterestBoardUrl);
    setPinterestState(
      "error" in result
        ? { status: "error", message: result.error }
        : { status: "ready", images: result.images, selected: new Set(), note: result.note }
    );
  }

  function toggleSelected(url: string) {
    setPinterestState((prev) => {
      if (prev.status !== "ready") return prev;
      const next = new Set(prev.selected);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return { ...prev, selected: next };
    });
  }

  async function handleImportSelected() {
    if (pinterestState.status !== "ready") return;
    const urls = [...pinterestState.selected];
    if (!urls.length) return;
    setImporting(true);
    for (const url of urls) {
      const formData = new FormData();
      formData.set("detailId", detailId);
      formData.set("boardType", importType);
      formData.set("sourceUrl", url);
      await addBoardImage(formData);
    }
    setImporting(false);
    setPinterestState({ status: "idle" });
  }

  return (
    <div className="panel-card span2">
      <h4>🎨 Mood board &amp; references</h4>

      <div className="field" style={{ marginBottom: "0.7rem" }}>
        <label className="field-label">Pinterest board link</label>
        <input
          defaultValue={pinterestBoardUrl || ""}
          placeholder="https://pinterest.com/you/board-name"
          onBlur={(e) => startTransition(() => updateDetail(detailId, { pinterestBoardUrl: e.target.value || null }))}
        />
        {pinterestBoardUrl ? (
          <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
            <a href={pinterestBoardUrl} target="_blank" rel="noopener" className="link-btn" style={{ textDecoration: "underline" }}>
              Open board ↗
            </a>
            <button className="secondary" onClick={handlePullFromPinterest} disabled={pinterestState.status === "loading"}>
              {pinterestState.status === "loading" ? "Fetching…" : "Pull images from this board"}
            </button>
          </div>
        ) : null}
        <div className="scratchpad-help" style={{ marginTop: "0.35rem" }}>
          Best-effort — reads whatever Pinterest&apos;s public board page happens to expose right now, not
          their official API. Works only for boards set to Public, may miss some pins, and can stop
          working if Pinterest changes their site.
        </div>
      </div>

      {pinterestState.status === "error" ? <div className="sync-banner">{pinterestState.message}</div> : null}

      {pinterestState.status === "ready" ? (
        <div
          className="card-pad"
          style={{ background: "var(--surface-2)", borderRadius: "var(--radius-sm)", marginBottom: "0.9rem" }}
        >
          <div className="section-title">
            <span>{pinterestState.images.length} found — tap the ones you want</span>
            <span style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="link-btn"
                onClick={() =>
                  setPinterestState((prev) =>
                    prev.status === "ready" ? { ...prev, selected: new Set(prev.images) } : prev
                  )
                }
              >
                Select all
              </button>
              <button
                className="link-btn"
                onClick={() =>
                  setPinterestState((prev) => (prev.status === "ready" ? { ...prev, selected: new Set() } : prev))
                }
              >
                Clear
              </button>
              <button className="icon-btn" onClick={() => setPinterestState({ status: "idle" })}>
                ✕
              </button>
            </span>
          </div>
          {pinterestState.note ? (
            <div className="sync-banner" style={{ marginBottom: "0.6rem" }}>
              {pinterestState.note}
            </div>
          ) : null}
          <div className="board-grid" style={{ maxHeight: "26rem", overflowY: "auto", paddingRight: "0.2rem" }}>
            {pinterestState.images.map((url) => {
              const checked = pinterestState.selected.has(url);
              return (
                <div
                  className={`pin-picker-item ${checked ? "selected" : ""}`}
                  key={url}
                  onClick={() => toggleSelected(url)}
                >
                  <img
                    src={url}
                    className="board-thumb"
                    alt=""
                    loading="lazy"
                    style={{ opacity: checked ? 1 : 0.5, outline: checked ? "3px solid var(--accent-strong)" : "none" }}
                  />
                  <div className="pin-picker-check">{checked ? "✓" : ""}</div>
                </div>
              );
            })}
          </div>
          <div className="inline-add-form" style={{ marginTop: "0.5rem" }}>
            <select value={importType} onChange={(e) => setImportType(e.target.value as BoardType)}>
              <option value="mood">Save as: Mood</option>
              <option value="reference">Save as: Assembly reference</option>
            </select>
            <button className="primary" onClick={handleImportSelected} disabled={importing || !pinterestState.selected.size}>
              {importing
                ? "Importing…"
                : `Import${pinterestState.selected.size ? ` ${pinterestState.selected.size}` : ""} selected`}
            </button>
          </div>
        </div>
      ) : null}

      <div className="board-grid">
        {images.length ? (
          images.map((img) => (
            <div className="board-item" key={img.id}>
              <img
                src={img.assetId ? `/asset/${img.assetId}` : img.sourceUrl || ""}
                className="board-thumb"
                alt=""
                loading="lazy"
              />
              <button
                className="board-type-badge"
                title="Click to switch between Mood and Assembly"
                onClick={() =>
                  startTransition(() =>
                    updateBoardImage(img.id, { boardType: img.boardType === "mood" ? "reference" : "mood" })
                  )
                }
              >
                {img.boardType === "mood" ? "🎨 Mood" : "🔧 Assembly"}
              </button>
              <input
                className="board-note"
                defaultValue={img.notes || ""}
                placeholder="Note…"
                onBlur={(e) => startTransition(() => updateBoardImage(img.id, { notes: e.target.value }))}
              />
              <button className="icon-btn board-del" onClick={() => startTransition(() => deleteBoardImage(img.id))}>
                ✕
              </button>
            </div>
          ))
        ) : (
          <div className="empty-note">No images yet — pull in whatever&apos;s shaping the vision, or how it goes together.</div>
        )}
      </div>

      <div className="inline-add-form">
        <select ref={typeRef} defaultValue="mood" style={{ maxWidth: "9rem" }}>
          <option value="mood">Mood</option>
          <option value="reference">Assembly ref</option>
        </select>
        <PhotoPickerButton
          onFileSelected={setPendingFile}
          disabled={uploading}
          className="secondary"
          label={pendingFile ? `📷 ${pendingFile.name.slice(0, 20)}` : "📷 Choose photo"}
        />
        <input placeholder="or paste an image URL" ref={urlRef} disabled={uploading} />
        <button className="secondary" onClick={handleAdd} disabled={uploading}>
          {uploading ? "Adding…" : "Add"}
        </button>
      </div>
    </div>
  );
}
