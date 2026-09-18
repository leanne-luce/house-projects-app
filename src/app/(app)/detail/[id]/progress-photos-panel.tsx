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
  contentTypeByAssetId,
}: {
  detailId: string;
  photos: ProgressPhoto[];
  contentTypeByAssetId: Record<string, string | null>;
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
            contentTypeByAssetId={contentTypeByAssetId}
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
  contentTypeByAssetId,
  onDelete,
}: {
  phase: string;
  detailId: string;
  photos: ProgressPhoto[];
  contentTypeByAssetId: Record<string, string | null>;
  onDelete: (id: string) => void;
}) {
  // Tracks how many uploads from this column's batch are still in flight,
  // rather than a single boolean — several files get uploaded one after
  // another (not in parallel, so ordering stays predictable and it's clear
  // in the UI how many are left), and a plain "uploading?" boolean would
  // otherwise flip back to false as soon as the first of several finishes.
  const [remaining, setRemaining] = useState(0);

  async function handleFiles(files: File[]) {
    setRemaining(files.length);
    for (const file of files) {
      // compressImage already leaves non-image files (video) untouched —
      // no client-side video compression, that's a much harder problem
      // with no simple free browser-side option; videos upload as-is.
      const prepared = await compressImage(file);
      const formData = new FormData();
      formData.set("detailId", detailId);
      formData.set("phase", phase);
      formData.set("file", prepared);
      await addProgressPhoto(formData);
      setRemaining((n) => n - 1);
    }
  }

  const uploading = remaining > 0;

  return (
    <div className="progress-col">
      <div className="progress-col-title">{phase[0].toUpperCase() + phase.slice(1)}</div>
      {photos.length ? (
        photos.map((p) => {
          const isVideo = (contentTypeByAssetId[p.assetId] || "").startsWith("video/");
          return (
            <div className="progress-photo-item" key={p.id}>
              {isVideo ? (
                <video src={`/asset/${p.assetId}`} className="progress-thumb" controls playsInline />
              ) : (
                <img src={`/asset/${p.assetId}`} className="progress-thumb" alt="" />
              )}
              <button className="icon-btn" onClick={() => onDelete(p.id)}>
                ✕
              </button>
            </div>
          );
        })
      ) : (
        <div className="empty-note">—</div>
      )}
      <PhotoPickerButton
        onFilesSelected={handleFiles}
        disabled={uploading}
        multiple
        accept="image/*,video/*"
        label={uploading ? `Uploading… (${remaining} left)` : "+ Add photos/video"}
        className="ghost"
        style={{ width: "100%", marginTop: "0.3rem", fontSize: "0.74rem", padding: "0.65rem 0.4rem", minHeight: "2.75rem" }}
      />
    </div>
  );
}
