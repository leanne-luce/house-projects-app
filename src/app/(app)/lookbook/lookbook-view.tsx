"use client";

import { useState, useTransition } from "react";
import {
  detailsForRoom,
  detailsDirectOnHouse,
  roomsForHouse,
  photosForRoom,
  photosForDetail,
  inspirationForRoom,
  inspirationForDetail,
  unassignedInspirationForHouse,
} from "@/lib/derived";
import {
  addProgressPhoto,
  deleteProgressPhoto,
  assignProgressPhotoToDetail,
  unassignProgressPhotoFromDetail,
  addBoardImage,
  deleteBoardImage,
  assignBoardImageToDetail,
  assignBoardImageToRoom,
} from "@/lib/actions";
import { compressImage } from "@/lib/compress-image";
import { PhotoPickerButton } from "@/components/photo-picker-button";
import { previewPinterestBoard } from "@/lib/pinterest";
import type {
  houses as housesTable,
  rooms as roomsTable,
  details as detailsTable,
  progressPhotos as progressPhotosTable,
  progressPhotoDetails as progressPhotoDetailsTable,
  boardImages as boardImagesTable,
  boardImageDetails as boardImageDetailsTable,
  boardImageRooms as boardImageRoomsTable,
} from "@/db/schema";

type House = typeof housesTable.$inferSelect;
type Room = typeof roomsTable.$inferSelect;
type Detail = typeof detailsTable.$inferSelect;
type ProgressPhoto = typeof progressPhotosTable.$inferSelect;
type ProgressPhotoLink = typeof progressPhotoDetailsTable.$inferSelect;
type BoardImage = typeof boardImagesTable.$inferSelect;
type BoardImageDetailLink = typeof boardImageDetailsTable.$inferSelect;
type BoardImageRoomLink = typeof boardImageRoomsTable.$inferSelect;

const PHASES = ["before", "during", "after"] as const;
const PHASE_LABEL: Record<string, string> = { before: "Before", during: "During", after: "After" };

export function LookbookView({
  houseId,
  houses,
  rooms: allRooms,
  details: allDetails,
  progressPhotos,
  progressPhotoDetails,
  boardImages,
  boardImageDetails,
  boardImageRooms,
  contentTypeByAssetId,
}: {
  houseId: string;
  houses: House[];
  rooms: Room[];
  details: Detail[];
  progressPhotos: ProgressPhoto[];
  progressPhotoDetails: ProgressPhotoLink[];
  boardImages: BoardImage[];
  boardImageDetails: BoardImageDetailLink[];
  boardImageRooms: BoardImageRoomLink[];
  contentTypeByAssetId: Record<string, string | null>;
}) {
  const rooms = roomsForHouse(allRooms, houseId);
  const houseDetails = allDetails.filter((d) => d.houseId === houseId);
  const directDetails = detailsDirectOnHouse(allDetails, houseId);
  const unassignedInspiration = unassignedInspirationForHouse(boardImages, boardImageDetails, boardImageRooms, houseId);

  const hasRoomContent = rooms.some(
    (r) =>
      photosForRoom(progressPhotos, progressPhotoDetails, allDetails, r.id).length ||
      inspirationForRoom(boardImages, boardImageDetails, boardImageRooms, allDetails, r.id).length
  );
  const hasDirectContent = directDetails.some(
    (d) =>
      photosForDetail(progressPhotos, progressPhotoDetails, d.id).length ||
      inspirationForDetail(boardImages, boardImageDetails, d.id).length
  );

  return (
    <>
      <InspirationInbox houseId={houseId} images={unassignedInspiration} rooms={rooms} details={houseDetails} contentTypeByAssetId={contentTypeByAssetId} />

      {rooms.map((room) => (
        <RoomSection
          key={room.id}
          room={room}
          details={detailsForRoom(allDetails, room.id)}
          houseDetails={houseDetails}
          progressPhotos={progressPhotos}
          progressPhotoDetails={progressPhotoDetails}
          boardImages={boardImages}
          boardImageDetails={boardImageDetails}
          boardImageRooms={boardImageRooms}
          contentTypeByAssetId={contentTypeByAssetId}
        />
      ))}

      {directDetails.length ? (
        <>
          {directDetails.map((detail) => (
            <DetailCard
              key={detail.id}
              detail={detail}
              roomName={null}
              photos={photosForDetail(progressPhotos, progressPhotoDetails, detail.id)}
              inspiration={inspirationForDetail(boardImages, boardImageDetails, detail.id)}
              contentTypeByAssetId={contentTypeByAssetId}
            />
          ))}
        </>
      ) : null}

      {!hasRoomContent && !hasDirectContent && !unassignedInspiration.length ? (
        <div className="empty-state">
          No photos or inspiration in {houses.find((h) => h.id === houseId)?.name} yet.
          <br />
          Add progress photos or inspiration on a Detail page, a room below, or the inbox above, and
          they&rsquo;ll show up here.
        </div>
      ) : null}
    </>
  );
}

// One room's slice of the Lookbook: its own before/after photos and
// inspiration (photosForRoom/inspirationForRoom already include anything
// uploaded through a detail inside this room, no extra work needed here),
// an uploader for room-level photos, and every detail in the room nested
// underneath with its own card.
function RoomSection({
  room,
  details,
  houseDetails,
  progressPhotos,
  progressPhotoDetails,
  boardImages,
  boardImageDetails,
  boardImageRooms,
  contentTypeByAssetId,
}: {
  room: Room;
  details: Detail[];
  houseDetails: Detail[];
  progressPhotos: ProgressPhoto[];
  progressPhotoDetails: ProgressPhotoLink[];
  boardImages: BoardImage[];
  boardImageDetails: BoardImageDetailLink[];
  boardImageRooms: BoardImageRoomLink[];
  contentTypeByAssetId: Record<string, string | null>;
}) {
  const roomPhotos = photosForRoom(progressPhotos, progressPhotoDetails, [...houseDetails], room.id);
  const roomInspiration = inspirationForRoom(boardImages, boardImageDetails, boardImageRooms, houseDetails, room.id);
  const detailEntries = details
    .map((detail) => ({
      detail,
      photos: photosForDetail(progressPhotos, progressPhotoDetails, detail.id),
      inspiration: inspirationForDetail(boardImages, boardImageDetails, detail.id),
    }))
    .filter((e) => e.photos.length || e.inspiration.length);

  if (!roomPhotos.length && !roomInspiration.length && !detailEntries.length) return null;

  return (
    <div className="card lookbook-card">
      <div className="lookbook-room-head">
        <span className="lookbook-name">{room.name}</span>
      </div>

      <RoomPhotoUploader roomId={room.id} />

      {roomPhotos.length ? (
        <PhotoColumns
          photos={roomPhotos}
          progressPhotoDetails={progressPhotoDetails}
          contentTypeByAssetId={contentTypeByAssetId}
          houseDetails={houseDetails}
          currentRoomId={room.id}
        />
      ) : null}

      {roomInspiration.length ? (
        <InspirationGrid images={roomInspiration} contentTypeByAssetId={contentTypeByAssetId} />
      ) : null}

      {detailEntries.length ? (
        <div style={{ marginTop: roomPhotos.length || roomInspiration.length ? "1rem" : 0 }}>
          {detailEntries.map(({ detail, photos, inspiration }) => (
            <DetailCard
              key={detail.id}
              detail={detail}
              roomName={null}
              nested
              photos={photos}
              inspiration={inspiration}
              contentTypeByAssetId={contentTypeByAssetId}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RoomPhotoUploader({ roomId }: { roomId: string }) {
  const [phase, setPhase] = useState<(typeof PHASES)[number]>("before");
  const [remaining, setRemaining] = useState(0);

  async function handleFiles(files: File[]) {
    setRemaining(files.length);
    for (const file of files) {
      const prepared = await compressImage(file);
      const formData = new FormData();
      formData.set("roomId", roomId);
      formData.set("phase", phase);
      formData.set("file", prepared);
      await addProgressPhoto(formData);
      setRemaining((n) => n - 1);
    }
  }

  const uploading = remaining > 0;

  return (
    <div className="inline-add-form" style={{ marginBottom: "0.8rem" }}>
      <select value={phase} onChange={(e) => setPhase(e.target.value as (typeof PHASES)[number])} style={{ maxWidth: "8rem" }}>
        {PHASES.map((p) => (
          <option key={p} value={p}>
            {PHASE_LABEL[p]}
          </option>
        ))}
      </select>
      <PhotoPickerButton
        onFilesSelected={handleFiles}
        multiple
        disabled={uploading}
        accept="image/*,video/*"
        label={uploading ? `Uploading… (${remaining} left)` : "+ Add photos for this room"}
        className="ghost"
      />
    </div>
  );
}

// Shows a room's (or a detail's, via the shared photosForDetail set)
// before/during/after columns. `houseDetails`/`currentRoomId` are only
// needed to offer the "assign to a detail" picker on each photo.
function PhotoColumns({
  photos,
  progressPhotoDetails,
  contentTypeByAssetId,
  houseDetails,
  currentRoomId,
}: {
  photos: ProgressPhoto[];
  progressPhotoDetails: ProgressPhotoLink[];
  contentTypeByAssetId: Record<string, string | null>;
  houseDetails: Detail[];
  currentRoomId: string;
}) {
  const [, startTransition] = useTransition();
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);
  const roomDetails = houseDetails.filter((d) => d.roomId === currentRoomId);

  return (
    <div className="lookbook-cols">
      {PHASES.map((phase) => {
        const phasePhotos = photos.filter((p) => p.phase === phase);
        if (!phasePhotos.length) return null;
        return (
          <div key={phase}>
            <div className="lookbook-col-title">{PHASE_LABEL[phase]}</div>
            <div className="lookbook-col-photos">
              {phasePhotos.map((p) => {
                const isVideo = (contentTypeByAssetId[p.assetId] || "").startsWith("video/");
                return (
                  <div key={p.id} style={{ position: "relative" }}>
                    <a className="lookbook-thumb-link" href={`/asset/${p.assetId}`} target="_blank" rel="noreferrer">
                      {isVideo ? (
                        <video src={`/asset/${p.assetId}`} className="lookbook-thumb" muted />
                      ) : (
                        <img src={`/asset/${p.assetId}`} className="lookbook-thumb" alt="" />
                      )}
                    </a>
                    <button
                      className="board-type-badge"
                      style={{ left: "0.25rem", right: "auto" }}
                      onClick={() => setOpenPickerId(openPickerId === p.id ? null : p.id)}
                    >
                      Assign
                    </button>
                    <button
                      className="icon-btn board-del"
                      onClick={() => startTransition(() => deleteProgressPhoto(p.id))}
                    >
                      ✕
                    </button>
                    {openPickerId === p.id ? (
                      <DetailPicker
                        details={roomDetails.length ? roomDetails : houseDetails}
                        checkedIds={new Set(progressPhotoDetails.filter((l) => l.progressPhotoId === p.id).map((l) => l.detailId))}
                        onToggle={(detailId, checked) =>
                          startTransition(() =>
                            checked
                              ? unassignProgressPhotoFromDetail(p.id, detailId)
                              : assignProgressPhotoToDetail(p.id, detailId)
                          )
                        }
                        onClose={() => setOpenPickerId(null)}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InspirationGrid({
  images,
  contentTypeByAssetId,
}: {
  images: BoardImage[];
  contentTypeByAssetId: Record<string, string | null>;
}) {
  return (
    <div className="board-grid" style={{ marginTop: "0.6rem" }}>
      {images.map((b) => {
        const isVideo = b.assetId ? (contentTypeByAssetId[b.assetId] || "").startsWith("video/") : false;
        const href = b.assetId ? `/asset/${b.assetId}` : b.sourceUrl || "#";
        const src = b.assetId ? `/asset/${b.assetId}` : b.sourceUrl || "";
        return (
          <a key={b.id} href={href} target="_blank" rel="noreferrer" className="board-item">
            {isVideo ? (
              <video src={src} className="board-thumb" muted />
            ) : (
              <img src={src} className="board-thumb" alt="" />
            )}
          </a>
        );
      })}
    </div>
  );
}

// A house-scoped detail (nested under its room, or flat for "not in a
// specific room") — same card treatment either way.
function DetailCard({
  detail,
  roomName,
  photos,
  inspiration,
  contentTypeByAssetId,
  nested,
}: {
  detail: Detail;
  roomName: string | null;
  photos: ProgressPhoto[];
  inspiration: BoardImage[];
  contentTypeByAssetId: Record<string, string | null>;
  nested?: boolean;
}) {
  if (!photos.length && !inspiration.length) return null;
  const Wrapper = nested ? "div" : "div";
  return (
    <Wrapper className={nested ? "lookbook-nested-card" : "card lookbook-card"}>
      <a href={`/detail/${detail.id}`} className="lookbook-card-head">
        <span className="lookbook-name" style={nested ? { fontSize: "0.95rem" } : undefined}>
          {detail.name}
        </span>
        <span className="breadcrumb">{roomName || "Not in a specific room"}</span>
      </a>
      {photos.length ? (
        <div className="lookbook-cols">
          {PHASES.map((phase) => {
            const phasePhotos = photos.filter((p) => p.phase === phase);
            if (!phasePhotos.length) return null;
            return (
              <div key={phase}>
                <div className="lookbook-col-title">{PHASE_LABEL[phase]}</div>
                <div className="lookbook-col-photos">
                  {phasePhotos.map((p) => {
                    const isVideo = (contentTypeByAssetId[p.assetId] || "").startsWith("video/");
                    return (
                      <a key={p.id} className="lookbook-thumb-link" href={`/asset/${p.assetId}`} target="_blank" rel="noreferrer">
                        {isVideo ? (
                          <video src={`/asset/${p.assetId}`} className="lookbook-thumb" muted />
                        ) : (
                          <img src={`/asset/${p.assetId}`} className="lookbook-thumb" alt="" />
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {inspiration.length ? (
        <details className="lookbook-inspiration">
          <summary>Inspiration ({inspiration.length})</summary>
          <InspirationGrid images={inspiration} contentTypeByAssetId={contentTypeByAssetId} />
        </details>
      ) : null}
    </Wrapper>
  );
}

// A checklist of a house's details (optionally scoped to one room's own
// details first) used to assign a progress photo to one or more of them.
function DetailPicker({
  details,
  checkedIds,
  onToggle,
  onClose,
}: {
  details: Detail[];
  checkedIds: Set<string>;
  onToggle: (detailId: string, checked: boolean) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="card-pad"
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        zIndex: 10,
        background: "var(--surface)",
        border: "1px solid var(--border-strong)",
        minWidth: "12rem",
        maxHeight: "12rem",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
        <span className="section-title" style={{ marginBottom: 0 }}>
          Assign to
        </span>
        <button className="icon-btn" onClick={onClose}>
          ✕
        </button>
      </div>
      {details.map((d) => (
        <label
          key={d.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.8125rem",
            padding: "0.25rem 0",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={checkedIds.has(d.id)}
            onChange={() => onToggle(d.id, checkedIds.has(d.id))}
            style={{ width: "auto" }}
          />
          {d.name}
        </label>
      ))}
    </div>
  );
}

type PinterestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; images: string[]; selected: Set<string>; note?: string };

// The house-level "upload now, assign later" bucket — every inspiration
// image this house owns that hasn't been tagged to a room or detail yet.
// Same three upload mechanisms as a Detail's own Inspiration panel (file,
// URL, Pinterest board pull), just targeting the house instead.
function InspirationInbox({
  houseId,
  images,
  rooms,
  details,
  contentTypeByAssetId,
}: {
  houseId: string;
  images: BoardImage[];
  rooms: Room[];
  details: Detail[];
  contentTypeByAssetId: Record<string, string | null>;
}) {
  const [, startTransition] = useTransition();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [pinterestUrl, setPinterestUrl] = useState("");
  const [pinterestState, setPinterestState] = useState<PinterestState>({ status: "idle" });
  const [importing, setImporting] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  async function handleAdd() {
    if (!pendingFiles.length && !sourceUrl.trim()) return;
    setUploading(true);
    for (const file of pendingFiles) {
      const formData = new FormData();
      formData.set("houseId", houseId);
      formData.set("boardType", "mood");
      formData.set("file", await compressImage(file));
      await addBoardImage(formData);
    }
    if (sourceUrl.trim()) {
      const formData = new FormData();
      formData.set("houseId", houseId);
      formData.set("boardType", "mood");
      formData.set("sourceUrl", sourceUrl);
      await addBoardImage(formData);
    }
    setUploading(false);
    setPendingFiles([]);
    setSourceUrl("");
  }

  async function handlePullFromPinterest() {
    if (!pinterestUrl.trim()) return;
    setPinterestState({ status: "loading" });
    const result = await previewPinterestBoard(pinterestUrl.trim());
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
      formData.set("houseId", houseId);
      formData.set("boardType", "mood");
      formData.set("sourceUrl", url);
      await addBoardImage(formData);
    }
    setImporting(false);
    setPinterestState({ status: "idle" });
  }

  return (
    <div className="card card-pad" style={{ marginBottom: "1rem" }}>
      <div className="section-title">Inspiration to sort {images.length ? `(${images.length})` : ""}</div>

      <div className="inline-add-form">
        <PhotoPickerButton
          onFilesSelected={setPendingFiles}
          multiple
          disabled={uploading}
          className="secondary"
          label={pendingFiles.length ? `${pendingFiles.length} photo${pendingFiles.length === 1 ? "" : "s"}` : "Choose photos"}
        />
        <input
          placeholder="or paste an image URL"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          disabled={uploading}
        />
        <button className="secondary" onClick={handleAdd} disabled={uploading}>
          {uploading ? "Adding…" : "Add"}
        </button>
      </div>

      <div className="inline-add-form" style={{ marginTop: "0.5rem" }}>
        <input
          placeholder="Pinterest board URL"
          value={pinterestUrl}
          onChange={(e) => setPinterestUrl(e.target.value)}
        />
        <button className="secondary" onClick={handlePullFromPinterest} disabled={pinterestState.status === "loading"}>
          {pinterestState.status === "loading" ? "Fetching…" : "Pull images from board"}
        </button>
      </div>

      {pinterestState.status === "error" ? <div className="sync-banner">{pinterestState.message}</div> : null}

      {pinterestState.status === "ready" ? (
        <div className="card-pad" style={{ background: "var(--surface-2)", marginTop: "0.6rem" }}>
          <div className="section-title">
            <span>{pinterestState.images.length} found — tap the ones you want</span>
            <span style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="link-btn"
                onClick={() =>
                  setPinterestState((prev) => (prev.status === "ready" ? { ...prev, selected: new Set(prev.images) } : prev))
                }
              >
                Select all
              </button>
              <button
                className="link-btn"
                onClick={() => setPinterestState((prev) => (prev.status === "ready" ? { ...prev, selected: new Set() } : prev))}
              >
                Clear
              </button>
              <button className="icon-btn" onClick={() => setPinterestState({ status: "idle" })}>
                ✕
              </button>
            </span>
          </div>
          {pinterestState.note ? <div className="sync-banner" style={{ marginBottom: "0.6rem" }}>{pinterestState.note}</div> : null}
          <div className="board-grid" style={{ maxHeight: "26rem", overflowY: "auto", paddingRight: "0.2rem" }}>
            {pinterestState.images.map((url) => {
              const checked = pinterestState.selected.has(url);
              return (
                <div className={`pin-picker-item ${checked ? "selected" : ""}`} key={url} onClick={() => toggleSelected(url)}>
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
            <button className="primary" onClick={handleImportSelected} disabled={importing || !pinterestState.selected.size}>
              {importing ? "Importing…" : `Import${pinterestState.selected.size ? ` ${pinterestState.selected.size}` : ""} selected`}
            </button>
          </div>
        </div>
      ) : null}

      {images.length ? (
        <div className="board-grid" style={{ marginTop: "0.8rem" }}>
          {images.map((b) => {
            const isVideo = b.assetId ? (contentTypeByAssetId[b.assetId] || "").startsWith("video/") : false;
            const src = b.assetId ? `/asset/${b.assetId}` : b.sourceUrl || "";
            return (
              <div className="board-item" key={b.id} style={{ position: "relative" }}>
                {isVideo ? <video src={src} className="board-thumb" muted /> : <img src={src} className="board-thumb" alt="" />}
                <button
                  className="board-type-badge"
                  onClick={() => setAssigningId(assigningId === b.id ? null : b.id)}
                >
                  Assign
                </button>
                <button className="icon-btn board-del" onClick={() => startTransition(() => deleteBoardImage(b.id))}>
                  ✕
                </button>
                {assigningId === b.id ? (
                  <RoomAndDetailPicker
                    rooms={rooms}
                    details={details}
                    onToggleRoom={(roomId) => startTransition(() => assignBoardImageToRoom(b.id, roomId))}
                    onToggleDetail={(detailId) => startTransition(() => assignBoardImageToDetail(b.id, detailId))}
                    onClose={() => setAssigningId(null)}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function RoomAndDetailPicker({
  rooms,
  details,
  onToggleRoom,
  onToggleDetail,
  onClose,
}: {
  rooms: Room[];
  details: Detail[];
  onToggleRoom: (roomId: string) => void;
  onToggleDetail: (detailId: string) => void;
  onClose: () => void;
}) {
  const noRoomDetails = details.filter((d) => !d.roomId);
  return (
    <div
      className="card-pad"
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        zIndex: 10,
        background: "var(--surface)",
        border: "1px solid var(--border-strong)",
        minWidth: "14rem",
        maxHeight: "16rem",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
        <span className="section-title" style={{ marginBottom: 0 }}>
          Assign to
        </span>
        <button className="icon-btn" onClick={onClose}>
          ✕
        </button>
      </div>
      {rooms.map((r) => (
        <div key={r.id} style={{ marginBottom: "0.4rem" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <input type="checkbox" onChange={() => onToggleRoom(r.id)} style={{ width: "auto" }} />
            {r.name}
          </label>
          <div style={{ paddingLeft: "1.3rem" }}>
            {details
              .filter((d) => d.roomId === r.id)
              .map((d) => (
                <label
                  key={d.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    marginTop: "0.2rem",
                    cursor: "pointer",
                  }}
                >
                  <input type="checkbox" onChange={() => onToggleDetail(d.id)} style={{ width: "auto" }} />
                  {d.name}
                </label>
              ))}
          </div>
        </div>
      ))}
      {noRoomDetails.length ? (
        <div>
          <div className="lookbook-col-title" style={{ marginTop: "0.4rem" }}>
            Not in a specific room
          </div>
          {noRoomDetails.map((d) => (
            <label
              key={d.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                marginTop: "0.2rem",
                cursor: "pointer",
              }}
            >
              <input type="checkbox" onChange={() => onToggleDetail(d.id)} style={{ width: "auto" }} />
              {d.name}
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
