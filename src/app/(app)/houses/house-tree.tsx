"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import { FinancialSummaryModal } from "./financial-summary-modal";
import { money, fmtTimeframe, budgetDeltaLabel } from "@/lib/format";
import {
  detailsDirectOnHouse,
  detailsForRoom,
  houseRollup,
  roomRollup,
  detailsRollup,
  nonFurniture,
  furnitureRollup,
  estimatedSpendFor,
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
import { ROOM_GROUP_VALUES } from "@/db/schema";
import type { details as detailsTable, houses as housesTable, lineItems as lineItemsTable, materialItems as materialItemsTable, rooms as roomsTable } from "@/db/schema";

type House = typeof housesTable.$inferSelect;
type Room = typeof roomsTable.$inferSelect;
type Detail = typeof detailsTable.$inferSelect;
type MaterialItem = typeof materialItemsTable.$inferSelect;
type LineItem = typeof lineItemsTable.$inferSelect;
type RoomGroup = (typeof ROOM_GROUP_VALUES)[number];

const ROOM_GROUP_LABEL: Record<RoomGroup, string> = {
  interior: "Interior",
  exterior: "Exterior",
  utility: "Utility",
};

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
  | { type: "financial"; houseId: string }
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
  // Rooms are collapsible too, independent of the house they're in — keyed
  // by room id, with a synthetic `${houseId}:none` key for the "not in a
  // specific room" bucket. Collapsed by default (unlike houses) — with a
  // dozen-plus rooms per house, starting everything open made the page a
  // long scroll before you'd even picked what to look at.
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(() => new Set());
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

  function toggleRoom(key: string) {
    setExpandedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (!houses.length) {
    return (
      <>
        <div className="empty-state">
          No houses yet.
          <br />
          Add your first one to start breaking it down into rooms and details.
        </div>
        <div className="add-row-btns">
          <button className="ghost" onClick={() => setModal({ type: "add-house" })}>
            + Add house
          </button>
        </div>
        {modal && modal.type !== "financial" ? <AddModal
            modal={modal}
            onClose={() => setModal(null)}
            houses={houses}
            onHouseAdded={(h) => setExpanded((prev) => new Set(prev).add(h.id))}
          /> : null}
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
        const delta = budgetDeltaLabel(rollup.actual, rollup.rough);

        const renderRoomCard = (r: Room) => {
          const ds = detailsForRoom(details, r.id);
          const rr = roomRollup(details, materialItems, lineItems, r.id);
          return (
            <RoomCard
              key={r.id}
              title={
                <input
                  className="room-name-input"
                  defaultValue={r.name}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={(e) => {
                    if (e.target.value.trim() && e.target.value !== r.name) {
                      startTransition(() => updateRoom(r.id, { name: e.target.value.trim() }));
                    }
                  }}
                />
              }
              group={(r.group as RoomGroup) || "interior"}
              onGroupChange={(g) => startTransition(() => updateRoom(r.id, { group: g }))}
              rollup={rr}
              open={expandedRooms.has(r.id)}
              onToggle={() => toggleRoom(r.id)}
              onDelete={() => {
                const msg = ds.length
                  ? `${ds.length} detail(s) in this room will move up to sit directly under the house. Continue?`
                  : "Delete this room?";
                if (confirm(msg)) startTransition(() => deleteRoom(r.id));
              }}
            >
              {ds.length ? (
                ds.map((d) => {
                  const act = actualCost(lineItems, d.id);
                  return (
                    <DetailRow
                      key={d.id}
                      detail={d}
                      rough={estimatedSpendFor(d, materialItems, act)}
                      actual={act}
                      onOpen={() => router.push(`/detail/${d.id}`)}
                    />
                  );
                })
              ) : (
                <div className="empty-note">No details yet.</div>
              )}
              <div className="add-row-btns">
                <button className="ghost" onClick={() => setModal({ type: "add-detail", houseId: h.id, roomId: r.id })}>
                  + Add detail
                </button>
              </div>
            </RoomCard>
          );
        };

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
                    style={{ width: "100%", textOverflow: "ellipsis" }}
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
                {money(rollup.actual)} spent{rollup.rough ? ` / ${money(rollup.rough)} planned` : ""}
                {delta ? (
                  <span style={{ color: delta.over ? "var(--danger)" : "var(--text-muted)", fontWeight: 700 }}>
                    {" "}
                    · {delta.text}
                  </span>
                ) : null}
                <br />
                <button
                  className="link-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModal({ type: "financial", houseId: h.id });
                  }}
                >
                  Financial summary
                </button>
              </div>
            </div>

            {open ? (
              <div className="house-body">
                {ROOM_GROUP_VALUES.map((g) => {
                  const groupRooms = houseRooms.filter((r) => ((r.group as RoomGroup) || "interior") === g);
                  if (!groupRooms.length) return null;
                  return (
                    <div className="room-group" key={g}>
                      <div className="room-group-title">{ROOM_GROUP_LABEL[g]}</div>
                      <div className="room-grid">{groupRooms.map(renderRoomCard)}</div>
                    </div>
                  );
                })}

                <div className="room-group">
                  <div className="room-grid">
                    <RoomCard
                      title={<span className="room-name">{houseRooms.length ? "Not in a specific room" : "Details"}</span>}
                      rollup={detailsRollup(nonFurniture(directDetails), materialItems, lineItems)}
                      open={expandedRooms.has(`${h.id}:none`)}
                      onToggle={() => toggleRoom(`${h.id}:none`)}
                    >
                      {directDetails.length ? (
                        directDetails.map((d) => {
                          const act = actualCost(lineItems, d.id);
                          return (
                            <DetailRow
                              key={d.id}
                              detail={d}
                              rough={estimatedSpendFor(d, materialItems, act)}
                              actual={act}
                              onOpen={() => router.push(`/detail/${d.id}`)}
                            />
                          );
                        })
                      ) : (
                        <div className="empty-note">
                          {houseRooms.length ? "Nothing loose here." : "No details yet."}
                        </div>
                      )}
                    </RoomCard>
                  </div>
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

      {modal ? (
        modal.type === "financial" ? (
          (() => {
            const house = houses.find((h) => h.id === modal.houseId);
            return house ? (
              <FinancialSummaryModal
                house={house}
                rollup={houseRollup(details, materialItems, lineItems, house.id)}
                furniture={furnitureRollup(details, materialItems, lineItems, house.id)}
                onClose={() => setModal(null)}
              />
            ) : null;
          })()
        ) : (
          <AddModal
            modal={modal}
            onClose={() => setModal(null)}
            houses={houses}
            onHouseAdded={(h) => setExpanded((prev) => new Set(prev).add(h.id))}
          />
        )
      ) : null}
    </>
  );
}

function RoomCard({
  title,
  rollup,
  open,
  onToggle,
  onDelete,
  group,
  onGroupChange,
  children,
}: {
  title: React.ReactNode;
  rollup: {
    count: number;
    rough: number;
    actual: number;
    over: number;
    remaining: number;
    done: number;
    counts: Record<string, number>;
  };
  open: boolean;
  onToggle: () => void;
  onDelete?: () => void;
  group?: RoomGroup;
  onGroupChange?: (group: RoomGroup) => void;
  children: React.ReactNode;
}) {
  const delta = budgetDeltaLabel(rollup.actual, rollup.rough);
  const donePct = rollup.count ? Math.round((rollup.done / rollup.count) * 100) : 0;
  return (
    <div className={`room-card ${open ? "open" : ""}`}>
      <div className="room-card-head" onClick={onToggle}>
        <span className={`chev ${open ? "open" : ""}`}>▸</span>
        <div className="room-card-title">
          {title}
          {onGroupChange ? (
            <select
              className="room-group-select"
              value={group}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onGroupChange(e.target.value as RoomGroup)}
            >
              {ROOM_GROUP_VALUES.map((g) => (
                <option key={g} value={g}>
                  {ROOM_GROUP_LABEL[g]}
                </option>
              ))}
            </select>
          ) : null}
          <div className="room-card-stats">
            {rollup.count} detail{rollup.count === 1 ? "" : "s"} · {money(rollup.actual)}
            {rollup.rough ? ` / ${money(rollup.rough)}` : ""}
            {delta ? (
              <span style={{ color: delta.over ? "var(--danger)" : "var(--text-muted)", fontWeight: 700 }}>
                {" "}
                · {delta.text}
              </span>
            ) : null}
          </div>
        </div>
        <span
          className={`status-pill ${donePct === 100 ? "status-done" : donePct === 0 ? "status-not_started" : "status-in_progress"}`}
        >
          {donePct}% done
        </span>
        {onDelete ? (
          <button
            className="icon-btn"
            title="Delete room"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            ✕
          </button>
        ) : null}
      </div>
      {open ? <div className="room-card-body">{children}</div> : null}
    </div>
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
  const tf = fmtTimeframe(detail.timeframeGranularity, detail.timeframeValue);
  return (
    <div className="list-item clickable" onClick={onOpen}>
      <div className="list-item-main">
        <div className="list-item-title">{detail.name}</div>
        <div className="list-item-meta">
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
      <div className="list-item-trailing">
        <span className="list-item-chevron">›</span>
      </div>
    </div>
  );
}

function AddModal({
  modal,
  onClose,
  houses,
  onHouseAdded,
}: {
  modal: Exclude<NonNullable<ModalState>, { type: "financial" }>;
  onClose: () => void;
  houses: House[];
  onHouseAdded: (house: House) => void;
}) {
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
              const house = await addHouse(name, address);
              if (house) onHouseAdded(house);
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
            const form = e.currentTarget;
            const name = (form.elements.namedItem("name") as HTMLInputElement).value;
            const group = (form.elements.namedItem("group") as HTMLSelectElement).value as RoomGroup;
            startTransition(async () => {
              await addRoom(modal.houseId, name, group);
              onClose();
            });
          }}
        >
          <div className="field">
            <label className="field-label">Room / area name</label>
            <input name="name" placeholder="e.g. Exterior, Kitchen, Master bedroom" autoFocus />
          </div>
          <div className="field">
            <label className="field-label">Group</label>
            <select name="group" defaultValue="interior">
              {ROOM_GROUP_VALUES.map((g) => (
                <option key={g} value={g}>
                  {ROOM_GROUP_LABEL[g]}
                </option>
              ))}
            </select>
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
