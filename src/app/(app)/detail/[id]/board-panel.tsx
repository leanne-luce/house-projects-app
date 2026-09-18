"use client";

import { useRef, useState, useTransition } from "react";
import { compressImage } from "@/lib/compress-image";
import { addBoardImage, updateBoardImageNotes, deleteBoardImage, updateDetail } from "@/lib/actions";
import type { boardImages as boardImagesTable } from "@/db/schema";

type BoardImage = typeof boardImagesTable.$inferSelect;

export function BoardPanel({
  detailId,
  boardType,
  title,
  images,
  emptyNote,
  pinterestBoardUrl,
}: {
  detailId: string;
  boardType: "mood" | "reference";
  title: string;
  images: BoardImage[];
  emptyNote: string;
  pinterestBoardUrl?: string | null;
}) {
  const [, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  async function handleAdd() {
    const file = fileRef.current?.files?.[0] || null;
    const sourceUrl = urlRef.current?.value || "";
    if (!file && !sourceUrl.trim()) return;

    setUploading(true);
    const formData = new FormData();
    formData.set("detailId", detailId);
    formData.set("boardType", boardType);
    formData.set("sourceUrl", sourceUrl);
    if (file) {
      const compressed = await compressImage(file);
      formData.set("file", compressed);
    }
    await addBoardImage(formData);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (urlRef.current) urlRef.current.value = "";
  }

  return (
    <div className="panel-card span2">
      <h4>{title}</h4>

      {boardType === "mood" ? (
        <div className="field" style={{ marginBottom: "0.7rem" }}>
          <label className="field-label">Pinterest board (reference link, not auto-synced)</label>
          <input
            defaultValue={pinterestBoardUrl || ""}
            placeholder="https://pinterest.com/you/board-name"
            onBlur={(e) => startTransition(() => updateDetail(detailId, { pinterestBoardUrl: e.target.value || null }))}
          />
          {pinterestBoardUrl ? (
            <div style={{ marginTop: "0.3rem" }}>
              <a href={pinterestBoardUrl} target="_blank" rel="noopener" className="link-btn" style={{ textDecoration: "underline" }}>
                Open board ↗
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="board-grid">
        {images.length ? (
          images.map((img) => (
            <div className="board-item" key={img.id}>
              <img src={img.assetId ? `/asset/${img.assetId}` : img.sourceUrl || ""} className="board-thumb" alt="" loading="lazy" />
              <input
                className="board-note"
                defaultValue={img.notes || ""}
                placeholder="Note…"
                onBlur={(e) => startTransition(() => updateBoardImageNotes(img.id, e.target.value))}
              />
              <button
                className="icon-btn board-del"
                onClick={() => startTransition(() => deleteBoardImage(img.id))}
              >
                ✕
              </button>
            </div>
          ))
        ) : (
          <div className="empty-note">{emptyNote}</div>
        )}
      </div>

      <div className="inline-add-form">
        <input type="file" accept="image/*" ref={fileRef} style={{ flex: 1 }} disabled={uploading} />
        <input placeholder="or paste an image URL" ref={urlRef} disabled={uploading} />
        <button className="secondary" onClick={handleAdd} disabled={uploading}>
          {uploading ? "Adding…" : "Add"}
        </button>
      </div>
    </div>
  );
}
