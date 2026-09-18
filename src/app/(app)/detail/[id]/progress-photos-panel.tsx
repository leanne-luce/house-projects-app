"use client";

import { useState, useTransition } from "react";
import { compressImage } from "@/lib/compress-image";
import { addProgressPhoto, deleteProgressPhoto } from "@/lib/actions";
import { PhotoPickerButton } from "@/components/photo-picker-button";
import type { progressPhotos as progressPhotosTable } from "@/db/schema";

type ProgressPhoto = typeof progressPhotosTable.$inferSelect;

const PHASES = ["before", "during", "after"] as const;

export function ProgressPhotosPanel({
  detailId,
  photos,
}: {
  detailId: string;
  photos: ProgressPhoto[];
}) {
  const [, startTransition] = useTransition();

  return (
    <div className="panel-card span2">
      <h4>📸 Progress photos</h4>
      <div className="progress-cols">
        {PHASES.map((phase) => (
          <PhaseColumn
            key={phase}
            phase={phase}
            detailId={detailId}
            photos={photos.filter((p) => p.phase === phase)}
            onDelete={(id) => startTransition(() => deleteProgressPhoto(id))}
          />
        ))}
      </div>
    </div>
  );
}

function PhaseColumn({
  phase,
  detailId,
  photos,
  onDelete,
}: {
  phase: string;
  detailId: string;
  photos: ProgressPhoto[];
  onDelete: (id: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.set("detailId", detailId);
    formData.set("phase", phase);
    formData.set("file", compressed);
    await addProgressPhoto(formData);
    setUploading(false);
  }

  return (
    <div className="progress-col">
      <div className="progress-col-title">{phase[0].toUpperCase() + phase.slice(1)}</div>
      {photos.length ? (
        photos.map((p) => (
          <div className="progress-photo-item" key={p.id}>
            <img src={`/asset/${p.assetId}`} className="progress-thumb" alt="" />
            <button className="icon-btn" onClick={() => onDelete(p.id)}>
              ✕
            </button>
          </div>
        ))
      ) : (
        <div className="empty-note">—</div>
      )}
      <PhotoPickerButton
        onFileSelected={handleFile}
        disabled={uploading}
        label={uploading ? "Uploading…" : "+ Add photo"}
        className="ghost"
        style={{ width: "100%", marginTop: "0.3rem", fontSize: "0.74rem", padding: "0.65rem 0.4rem", minHeight: "2.75rem" }}
      />
    </div>
  );
}
