"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import { money } from "@/lib/format";
import {
  detailsDirectOnHouse,
  detailsForRoom,
  houseRollup,
  roomRollup,
  roughCost,
  actualCost,
} from "@/lib/derived";
import {
  addHouse,
  updateHouse,
  deleteHouse,
  addRoom,
  updateRoom,
  deleteRoom,
  addDetail,
} from "@/lib/actions";
import type { details as detailsTable, houses as housesTable, lineItems as lineItemsTable, materialItems as materialItemsTable, rooms as roomsTable } from "@/db/schema";

type House = typeof housesTable.$inferSelect;
type Room = typeof roomsTable.$inferSelect;
type Detail = typeof detailsTable.$inferSelect;
type MaterialItem = typeof materialItemsTable.$inferSelect;
type LineItem = typeof lineItemsTable.$inferSelect;

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
  on_hold: "On hold",
};

type ModalState =
  | { type: "add-house" }
  | { type: "add-room"; houseId: string }
  | { type: "add-detail"; houseId: string; roomId: string | null }
  | null;

export function HouseTree({
  houses,
  rooms,
  details,
  materialItems,
  lineItems,
}: {
  houses: House[];
  rooms: Room[];
  details: Detail[];
  materialItems: MaterialItem[];
  lineItems: LineItem[];
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(houses.map((h) => h.id)));
  const [modal, setModal] = useState<ModalState>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  function toggle(houseId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(houseId)) next.delete(houseId);
      else next.add(houseId);
      return next;
    });
  }

  if (!houses.length) {
    return (
      <>
        <div className="empty-state">
          <div className="big-emoji">🏡</div>
          No houses yet.
          <br />
          Add your first one to start breaking it down into rooms and details.
        </div>
        <div className="add-row-btns">
          <button className="ghost" onClick={() => setModal({ type: "add-house" })}>
            + Add house
          </button>
        </div>
        {modal ? <AddModal modal={modal} onClose={() => setModal(null)} houses={houses} /> : null}
      </>
    );
  }

  return (
    <>
      {houses.map((h) => {
        const open = expanded.has(h.id);
        const rollup = houseRollup(details, materialItems, lineItems, h.id);
        const houseRooms = rooms.filter((r) => r.houseId === h.id);
        const directDetails = detailsDirectOnHouse(details, h.id);

        return (
          <div className="card house-card" key={h.id}>
            <div className="house-head" onClick={() => toggle(h.id)}>
              <div className="house-title">
                <span className={`chev ${open ? "open" : ""}`}>▸</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <input
                    className="house-name-input"
                    defaultValue={h.name}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      if (e.target.value.trim() && e.target.value !== h.name) {
                        startTransition(() => updateHouse(h.id, { name: e.target.value.trim() }));
                      }
                    }}
                  />
                  <input
                    className="house-address-input"
                    defaultValue={h.address || ""}
                    placeholder="Address (optional)"
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      if (e.target.value !== (h.address || "")) {
                        startTransition(() => updateHouse(h.id, { address: e.target.value || null }));
                      }
                    }}
                  />
                </div>
              </div>
              <div className="house-stats">
                {rollup.count} detail{rollup.count === 1 ? "" : "s"}
                <br />
                {money(rollup.actual)} spent{rollup.rough ? ` · ${money(rollup.rough)} planned` : ""}
              </div>
            </div>

            {open ? (
              <div className="house-body">
                {houseRooms.map((r) => {
                  const ds = detailsForRoom(details, r.id);
                  const rr = roomRollup(details, materialItems, lineItems, r.id);
                  return (
                    <div className="room-block" key={r.id}>
                      <div className="room-head">
                        <input
                          className="room-name-input"
                          defaultValue={r.name}
                          onBlur={(e) => {
                            if (e.target.value.trim() && e.target.value !== r.name) {
                              startTransition(() => updateRoom(r.id, { name: e.target.value.trim() }));
                            }
                          }}
                        />
                        <span style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
                          {money(rr.actual)}
                          {rr.rough ? ` / ${money(rr.rough)} planned` : ""}
                          <button
                            className="icon-btn"
                            title="Delete room"
                            onClick={() => {
                              const msg = ds.length
                                ? `${ds.length} detail(s) in this room will move up to sit directly under the house. Continue?`
                                : "Delete this room?";
                              if (confirm(msg)) startTransition(() => deleteRoom(r.id));
                            }}
                          >
                            ✕
                          </button>
                        </span>
                      </div>
                      {ds.length ? (
                        ds.map((d) => (
                          <DetailRow
                            key={d.id}
                            detail={d}
                            rough={roughCost(materialItems, d.id)}
                            actual={actualCost(lineItems, d.id)}
                            onOpen={() => router.push(`/detail/${d.id}`)}
                          />
                        ))
                      ) : (
                        <div className="empty-note">No details yet.</div>
                      )}
                      <div className="add-row-btns">
                        <button
                          className="ghost"
                          onClick={() => setModal({ type: "add-detail", houseId: h.id, roomId: r.id })}
                        >
                          + Add detail
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="room-block">
                  <div className="room-head">
                    <span className="room-name">{houseRooms.length ? "Not in a specific room" : "Details"}</span>
                  </div>
                  {directDetails.length ? (
                    directDetails.map((d) => (
                      <DetailRow
                        key={d.id}
                        detail={d}
                        rough={roughCost(materialItems, d.id)}
                        actual={actualCost(lineItems, d.id)}
                        onOpen={() => router.push(`/detail/${d.id}`)}
                      />
                    ))
                  ) : (
                    <div className="empty-note">
                      {houseRooms.length ? "Nothing loose here." : "No details yet."}
                    </div>
                  )}
                </div>

                <div className="add-row-btns">
                  <button className="ghost" onClick={() => setModal({ type: "add-room", houseId: h.id })}>
                    + Add room
                  </button>
                  <button
                    className="ghost"
                    onClick={() => setModal({ type: "add-detail", houseId: h.id, roomId: null })}
                  >
                    + Add detail
                  </button>
                  <button
                    className="ghost"
                    style={{ marginLeft: "auto", color: "var(--danger)", borderColor: "var(--danger-soft)" }}
                    onClick={() => {
                      if (
                        confirm(
                          `Delete "${h.name}" and everything in it — ${rollup.count} detail(s), ${houseRooms.length} room(s)? This can't be undone.`
                        )
                      ) {
                        startTransition(() => deleteHouse(h.id));
                      }
                    }}
                  >
                    Delete house
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}

      <div className="add-row-btns">
        <button className="ghost" onClick={() => setModal({ type: "add-house" })}>
          + Add house
        </button>
      </div>

      {modal ? <AddModal modal={modal} onClose={() => setModal(null)} houses={houses} /> : null}
    </>
  );
}

function DetailRow({
  detail,
  rough,
  actual,
  onOpen,
}: {
  detail: Detail;
  rough: number;
  actual: number;
  onOpen: () => void;
}) {
  const tf = detail.timeframeGranularity
    ? `${detail.timeframeGranularity[0].toUpperCase()}${detail.timeframeGranularity.slice(1)}: ${
        detail.timeframeValue || "—"
      }`
    : "";
  return (
    <div className="detail-row" onClick={onOpen}>
      <div>
        <div className="detail-name">{detail.name}</div>
        <div className="detail-meta">
          <span className={`status-pill status-${detail.status || "not_started"}`}>
            {STATUS_LABEL[detail.status || "not_started"]}
          </span>
          {tf ? <span>{tf}</span> : null}
          {actual || rough ? (
            <span>
              {money(actual)}
              {rough ? ` / ${money(rough)}` : ""}
            </span>
          ) : null}
        </div>
      </div>
      <span style={{ color: "var(--text-faint)" }}>›</span>
    </div>
  );
}

function AddModal({ modal, onClose, houses }: { modal: NonNullable<ModalState>; onClose: () => void; houses: House[] }) {
  const [pending, startTransition] = useTransition();

  if (modal.type === "add-house") {
    return (
      <Modal title="Add a house" onClose={onClose}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const name = (form.elements.namedItem("name") as HTMLInputElement).value;
            const address = (form.elements.namedItem("address") as HTMLInputElement).value;
            startTransition(async () => {
              await addHouse(name, address);
              onClose();
            });
          }}
        >
          <div className="field">
            <label className="field-label">Name</label>
            <input name="name" placeholder="e.g. Sea Cliff house" autoFocus />
          </div>
          <div className="field">
            <label className="field-label">Address (optional)</label>
            <input name="address" placeholder="12 20th Avenue" />
          </div>
          <button className="primary" type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add house"}
          </button>
        </form>
      </Modal>
    );
  }

  if (modal.type === "add-room") {
    const house = houses.find((h) => h.id === modal.houseId);
    return (
      <Modal title={`Add a room — ${house?.name ?? ""}`} onClose={onClose}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const name = (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value;
            startTransition(async () => {
              await addRoom(modal.houseId, name);
              onClose();
            });
          }}
        >
          <div className="field">
            <label className="field-label">Room / area name</label>
            <input name="name" placeholder="e.g. Exterior, Kitchen, Master bedroom" autoFocus />
          </div>
          <button className="primary" type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add room"}
          </button>
        </form>
      </Modal>
    );
  }

  // add-detail
  const house = houses.find((h) => h.id === modal.houseId);
  return (
    <Modal title={`Add a detail — ${house?.name ?? ""}`} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const name = (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value;
          startTransition(async () => {
            await addDetail(modal.houseId, modal.roomId, name);
            onClose();
          });
        }}
      >
        <div className="field">
          <label className="field-label">Detail name</label>
          <input name="name" placeholder="e.g. Shutters, Cabinets, Closet" autoFocus />
        </div>
        <button className="primary" type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add detail"}
        </button>
      </form>
    </Modal>
  );
}
