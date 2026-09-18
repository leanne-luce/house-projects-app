"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { fmtDate } from "@/lib/format";
import { detailPath } from "@/lib/derived";
import { addInboxItem, fileInboxItem, discardInboxItem, fileInboxItemToNew } from "@/lib/actions";
import { compressImage } from "@/lib/compress-image";
import type { details as detailsTable, houses as housesTable, inboxItems as inboxItemsTable, rooms as roomsTable } from "@/db/schema";

type House = typeof housesTable.$inferSelect;
type Room = typeof roomsTable.$inferSelect;
type Detail = typeof detailsTable.$inferSelect;
type InboxItem = typeof inboxItemsTable.$inferSelect;

export function InboxList({
  unfiled,
  details,
  houses,
  rooms,
}: {
  unfiled: InboxItem[];
  details: Detail[];
  houses: House[];
  rooms: Room[];
}) {
  const [pending, startTransition] = useTransition();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sortedDetails = [...details].sort((a, b) =>
    detailPath(houses, rooms, a).localeCompare(detailPath(houses, rooms, b))
  );

  return (
    <>
      <div className="card card-pad" style={{ marginBottom: "1rem" }}>
        <div className="section-title" style={{ marginBottom: "0.6rem" }}>
          Quick capture
        </div>
        <div className="field">
          <textarea ref={textRef} rows={2} placeholder="A stray thought, a material, a link…" />
        </div>
        <div className="inline-add-form">
          <input type="file" accept="image/*" ref={fileRef} style={{ flex: 1 }} disabled={pending} />
          <button
            className="primary"
            disabled={pending}
            onClick={() => {
              const text = textRef.current?.value || "";
              const file = fileRef.current?.files?.[0] || null;
              if (!text.trim() && !file) return;
              startTransition(async () => {
                const formData = new FormData();
                formData.set("text", text);
                if (file) formData.set("file", await compressImage(file));
                await addInboxItem(formData);
                if (textRef.current) textRef.current.value = "";
                if (fileRef.current) fileRef.current.value = "";
              });
            }}
          >
            {pending ? "Adding…" : "Add to inbox"}
          </button>
        </div>
      </div>

      {!unfiled.length ? (
        <div className="empty-state">
          <div className="big-emoji">📥</div>
          Inbox is empty. Whatever you capture on the fly lands here until you&apos;re ready to file it.
        </div>
      ) : (
        <div className="card">
          {unfiled.map((item, idx) => (
            <InboxRow
              key={item.id}
              item={item}
              isLast={idx === unfiled.length - 1}
              sortedDetails={sortedDetails}
              houses={houses}
              rooms={rooms}
            />
          ))}
        </div>
      )}
      <datalist id="houseList">
        {houses.map((h) => (
          <option key={h.id} value={h.name} />
        ))}
      </datalist>
    </>
  );
}

function InboxRow({
  item,
  isLast,
  sortedDetails,
  houses,
  rooms,
}: {
  item: InboxItem;
  isLast: boolean;
  sortedDetails: Detail[];
  houses: House[];
  rooms: Room[];
}) {
  const [filing, setFiling] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="inbox-item" style={isLast ? {} : { borderBottom: "1px solid var(--border)" }}>
      {item.assetId ? (
        <img className="inbox-photo" src={`/asset/${item.assetId}`} alt="" />
      ) : (
        <div
          className="inbox-photo"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", borderRadius: 8 }}
        >
          📝
        </div>
      )}
      <div className="inbox-item-body">
        <div className="inbox-item-text">
          {item.text || <i style={{ color: "var(--text-faint)" }}>(photo only)</i>}
        </div>
        <div className="inbox-item-time">{fmtDate(item.createdAt)}</div>
        <div className="inbox-actions">
          <button className="secondary" onClick={() => setFiling((v) => !v)}>
            File…
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              if (confirm("Discard this inbox item?")) startTransition(() => discardInboxItem(item.id));
            }}
          >
            Discard
          </button>
        </div>

        {filing ? (
          <div className="file-picker open">
            <div className="field">
              <label className="field-label">File to existing detail</label>
              <select
                defaultValue=""
                disabled={pending}
                onChange={(e) => {
                  const detailId = e.target.value;
                  if (!detailId) return;
                  startTransition(async () => {
                    await fileInboxItem(item.id, detailId);
                    router.push(`/detail/${detailId}`);
                  });
                }}
              >
                <option value="">Choose a detail…</option>
                {sortedDetails.map((d) => (
                  <option key={d.id} value={d.id}>
                    {detailPath(houses, rooms, d)}
                  </option>
                ))}
              </select>
            </div>
            <button className="link-btn" onClick={() => setCreatingNew((v) => !v)}>
              {creatingNew ? "– cancel new detail" : "+ or create a new detail for this"}
            </button>
            {creatingNew ? (
              <form
                className="new-detail-inline open"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const house = (form.elements.namedItem("house") as HTMLInputElement).value;
                  const room = (form.elements.namedItem("room") as HTMLInputElement).value;
                  const detailName = (form.elements.namedItem("detail") as HTMLInputElement).value;
                  if (!house.trim() || !detailName.trim()) return;
                  startTransition(async () => {
                    await fileInboxItemToNew(item.id, house, room, detailName);
                  });
                }}
              >
                <input name="house" placeholder="House (existing or new)" list="houseList" />
                <input name="room" placeholder="Room (optional)" />
                <input name="detail" placeholder="Detail name" />
                <button className="primary" type="submit" disabled={pending}>
                  Create &amp; file
                </button>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
