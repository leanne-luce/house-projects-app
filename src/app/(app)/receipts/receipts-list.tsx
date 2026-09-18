"use client";

import { useState, useTransition } from "react";
import { money, fmtDate } from "@/lib/format";
import { detailPath } from "@/lib/derived";
import { PhotoPickerButton } from "@/components/photo-picker-button";
import {
  uploadReceipt,
  rescanReceipt,
  deleteReceipt,
  addManualReceiptItem,
  assignReceiptLineItem,
  dismissReceiptLineItem,
} from "@/lib/actions";
import type {
  receipts as receiptsTable,
  receiptLineItems as receiptLineItemsTable,
  details as detailsTable,
  houses as housesTable,
  rooms as roomsTable,
} from "@/db/schema";

type Receipt = typeof receiptsTable.$inferSelect;
type ReceiptLineItem = typeof receiptLineItemsTable.$inferSelect;
type Detail = typeof detailsTable.$inferSelect;
type House = typeof housesTable.$inferSelect;
type Room = typeof roomsTable.$inferSelect;

const STATUS_LABEL: Record<string, string> = { new: "New", processing: "Scanning…", logged: "Logged" };

export function ReceiptsList({
  receipts,
  receiptLineItems,
  details,
  houses,
  rooms,
}: {
  receipts: Receipt[];
  receiptLineItems: ReceiptLineItem[];
  details: Detail[];
  houses: House[];
  rooms: Room[];
}) {
  const sortedDetails = [...details].sort((a, b) =>
    detailPath(houses, rooms, a).localeCompare(detailPath(houses, rooms, b))
  );

  return (
    <>
      <UploadForm />
      {!receipts.length ? (
        <div className="empty-state">
          <div className="big-emoji">🧾</div>
          No receipts yet.
        </div>
      ) : (
        receipts.map((r) => (
          <ReceiptCard
            key={r.id}
            receipt={r}
            items={receiptLineItems.filter((i) => i.receiptId === r.id)}
            sortedDetails={sortedDetails}
            houses={houses}
            rooms={rooms}
          />
        ))
      )}
    </>
  );
}

function UploadForm() {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(force: boolean) {
    if (!pendingFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.set("file", pendingFile);
    if (force) formData.set("force", "true");
    const result = await uploadReceipt(formData);
    setUploading(false);

    if ("duplicate" in result) {
      const proceed = confirm(
        `This looks like a receipt you've already uploaded (${fmtDate(result.uploadedAt)}). Upload it again anyway?`
      );
      if (proceed) await handleUpload(true);
      return;
    }
    if ("error" in result) {
      alert(result.error);
      return;
    }
    setPendingFile(null);
  }

  return (
    <div className="card card-pad" style={{ marginBottom: "1rem" }}>
      <div className="section-title" style={{ marginBottom: "0.5rem" }}>
        Upload a receipt
      </div>
      <div className="inline-add-form">
        <PhotoPickerButton
          onFileSelected={setPendingFile}
          disabled={uploading}
          className="secondary"
          label={pendingFile ? `📷 ${pendingFile.name.slice(0, 24)}` : "📷 Choose receipt photo"}
        />
        <button className="primary" onClick={() => handleUpload(false)} disabled={uploading || !pendingFile}>
          {uploading ? "Scanning…" : "Upload & scan"}
        </button>
      </div>
      <div className="scratchpad-help" style={{ marginTop: "0.4rem" }}>
        Runs OCR on the server to pull out line items — it&apos;s imperfect, so review what it finds. Uploading
        the same photo twice gets flagged.
      </div>
    </div>
  );
}

function ReceiptCard({
  receipt,
  items,
  sortedDetails,
  houses,
  rooms,
}: {
  receipt: Receipt;
  items: ReceiptLineItem[];
  sortedDetails: Detail[];
  houses: House[];
  rooms: Room[];
}) {
  const [manualOpen, setManualOpen] = useState(false);
  const [rescanning, setRescanning] = useState(false);
  const [, startTransition] = useTransition();

  const pending = items.filter((i) => i.status === "pending");
  const statusLabel = STATUS_LABEL[receipt.status] || receipt.status;
  const statusClass =
    receipt.status === "logged" ? "status-done" : receipt.status === "processing" ? "status-in_progress" : "status-not_started";

  return (
    <div className="card" style={{ marginBottom: "0.9rem" }}>
      <div style={{ display: "flex", gap: "0.8rem", padding: "0.9rem" }}>
        <img
          src={`/asset/${receipt.assetId}`}
          style={{ width: "4.5rem", height: "4.5rem", objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)", flexShrink: 0 }}
          alt=""
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{fmtDate(receipt.uploadedAt)}</div>
            <span className={`status-pill ${statusClass}`}>{statusLabel}</span>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-faint)", marginTop: "0.15rem" }}>
            {items.length
              ? `${items.length} item${items.length === 1 ? "" : "s"} found — ${pending.length} to review`
              : receipt.status === "processing"
                ? "Scanning for line items…"
                : "No items extracted yet"}
          </div>
          {receipt.ocrError ? (
            <div style={{ fontSize: "0.74rem", color: "var(--warn)", marginTop: "0.2rem" }}>{receipt.ocrError}</div>
          ) : null}
          <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.7rem", flexWrap: "wrap", alignItems: "center" }}>
            <button
              className="link-btn"
              disabled={rescanning}
              onClick={async () => {
                setRescanning(true);
                await rescanReceipt(receipt.id);
                setRescanning(false);
              }}
            >
              {rescanning ? "Scanning…" : items.length ? "Re-scan" : "Run OCR"}
            </button>
            <button className="link-btn" onClick={() => setManualOpen((v) => !v)}>
              + Add item manually
            </button>
            <button
              className="icon-btn"
              title="Delete receipt"
              onClick={() => {
                if (confirm("Delete this receipt and its extracted items? Any spend already assigned from it stays put.")) {
                  startTransition(() => deleteReceipt(receipt.id));
                }
              }}
            >
              ✕
            </button>
          </div>
          <div className={`new-detail-inline ${manualOpen ? "open" : ""}`}>
            <ManualItemForm receiptId={receipt.id} onAdded={() => setManualOpen(false)} />
          </div>
        </div>
      </div>
      {items.length ? (
        <div style={{ padding: "0 0.9rem 0.9rem" }}>
          {items.map((item) => (
            <ReceiptLineItemRow key={item.id} item={item} sortedDetails={sortedDetails} houses={houses} rooms={rooms} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ManualItemForm({ receiptId, onAdded }: { receiptId: string; onAdded: () => void }) {
  const [, startTransition] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const desc = (form.elements.namedItem("desc") as HTMLInputElement).value;
        const amount = (form.elements.namedItem("amount") as HTMLInputElement).value;
        if (!desc.trim()) return;
        startTransition(() => addManualReceiptItem(receiptId, desc, amount));
        form.reset();
        onAdded();
      }}
    >
      <input name="desc" placeholder="Item description" />
      <input name="amount" type="number" step="any" placeholder="Amount" />
      <button className="primary" type="submit">
        Add item
      </button>
    </form>
  );
}

function ReceiptLineItemRow({
  item,
  sortedDetails,
  houses,
  rooms,
}: {
  item: ReceiptLineItem;
  sortedDetails: Detail[];
  houses: House[];
  rooms: Room[];
}) {
  const [, startTransition] = useTransition();

  if (item.status === "dismissed") {
    return (
      <div className="list-item" style={{ opacity: 0.55 }}>
        <div className="list-item-main">
          {item.description} — {money(item.amount)} <span style={{ fontSize: "0.7rem" }}>(dismissed)</span>
        </div>
      </div>
    );
  }

  if (item.status === "assigned") {
    const assignedDetail = sortedDetails.find((d) => d.id === item.assignedDetailId);
    return (
      <div className="list-item" style={{ opacity: 0.8 }}>
        <div className="list-item-main">
          {item.description} — {money(item.amount)}{" "}
          <span style={{ fontSize: "0.7rem", color: "var(--good)" }}>
            ✓ {assignedDetail ? detailPath(houses, rooms, assignedDetail) : ""}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="list-item">
      <div className="list-item-main">
        {item.description} — {money(item.amount)}
        <div className="inline-add-form" style={{ marginTop: "0.35rem" }}>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) startTransition(() => assignReceiptLineItem(item.id, e.target.value));
            }}
          >
            <option value="">Assign to detail…</option>
            {sortedDetails.map((d) => (
              <option key={d.id} value={d.id}>
                {detailPath(houses, rooms, d)}
              </option>
            ))}
          </select>
          <button className="secondary" onClick={() => startTransition(() => dismissReceiptLineItem(item.id))}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
