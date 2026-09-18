"use client";

import { useState, useTransition } from "react";
import { money, fmtDate } from "@/lib/format";
import { roomPath } from "@/lib/derived";
import { PhotoPickerButton } from "@/components/photo-picker-button";
import {
  uploadReceipt,
  rescanReceipt,
  deleteReceipt,
  addManualReceiptItem,
  assignReceiptLineItem,
  dismissReceiptLineItem,
  restoreReceiptLineItem,
  updateReceiptLineItem,
  updateReceiptVendor,
} from "@/lib/actions";
import type {
  receipts as receiptsTable,
  receiptLineItems as receiptLineItemsTable,
  details as detailsTable,
  rooms as roomsTable,
} from "@/db/schema";

type Receipt = typeof receiptsTable.$inferSelect;
type ReceiptLineItem = typeof receiptLineItemsTable.$inferSelect;
type Detail = typeof detailsTable.$inferSelect;
type Room = typeof roomsTable.$inferSelect;

const STATUS_LABEL: Record<string, string> = { new: "New", processing: "Scanning…", logged: "Logged" };

export function ReceiptsList({
  houseId,
  receipts,
  receiptLineItems,
  details,
  rooms,
  contentTypeByAssetId,
}: {
  houseId: string;
  receipts: Receipt[];
  receiptLineItems: ReceiptLineItem[];
  details: Detail[];
  rooms: Room[];
  contentTypeByAssetId: Record<string, string | null>;
}) {
  const sortedDetails = [...details].sort((a, b) =>
    roomPath(rooms, a).localeCompare(roomPath(rooms, b))
  );

  return (
    <>
      <UploadForm houseId={houseId} />
      {!receipts.length ? (
        <div className="empty-state">
          <div className="big-emoji">🧾</div>
          No receipts yet for this house.
        </div>
      ) : (
        receipts.map((r) => (
          <ReceiptCard
            key={r.id}
            receipt={r}
            items={receiptLineItems.filter((i) => i.receiptId === r.id)}
            sortedDetails={sortedDetails}
            rooms={rooms}
            isPdf={contentTypeByAssetId[r.assetId] === "application/pdf"}
          />
        ))
      )}
    </>
  );
}

function UploadForm({ houseId }: { houseId: string }) {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(force: boolean) {
    if (!pendingFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.set("file", pendingFile);
    formData.set("houseId", houseId);
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
          accept="image/*,application/pdf"
          label={pendingFile ? `📎 ${pendingFile.name.slice(0, 24)}` : "📎 Choose receipt (photo or PDF)"}
        />
        <button className="primary" onClick={() => handleUpload(false)} disabled={uploading || !pendingFile}>
          {uploading ? "Scanning…" : "Upload & scan"}
        </button>
      </div>
      <div className="scratchpad-help" style={{ marginTop: "0.4rem" }}>
        Photos run through OCR; PDFs get their embedded text read directly (a scanned PDF with no real text
        layer won&apos;t have anything to read — add items by hand in that case). Both are imperfect, so
        review what&apos;s found. Uploading the same file twice gets flagged.
      </div>
    </div>
  );
}

function ReceiptCard({
  receipt,
  items,
  sortedDetails,
  rooms,
  isPdf,
}: {
  receipt: Receipt;
  items: ReceiptLineItem[];
  sortedDetails: Detail[];
  rooms: Room[];
  isPdf: boolean;
}) {
  // Logged receipts are a settled record — collapsed by default so a long
  // history doesn't bury the ones still needing attention (new/processing,
  // or anything with pending items to review).
  const [open, setOpen] = useState(() => receipt.status !== "logged");
  const [manualOpen, setManualOpen] = useState(false);
  const [rescanning, setRescanning] = useState(false);
  const [, startTransition] = useTransition();

  const pending = items.filter((i) => i.status === "pending");
  const statusLabel = STATUS_LABEL[receipt.status] || receipt.status;
  const statusClass =
    receipt.status === "logged" ? "status-done" : receipt.status === "processing" ? "status-in_progress" : "status-not_started";

  return (
    <div className="card receipt-card" style={{ marginBottom: "0.9rem" }}>
      <div className="receipt-card-head" onClick={() => setOpen((v) => !v)}>
        <span className={`chev ${open ? "open" : ""}`}>▸</span>
        {isPdf ? (
          <a
            href={`/asset/${receipt.assetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="receipt-thumb-box"
            onClick={(e) => e.stopPropagation()}
            title="Open PDF"
          >
            📄
          </a>
        ) : (
          <img src={`/asset/${receipt.assetId}`} className="receipt-thumb-box" alt="" />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
            <input
              defaultValue={receipt.vendor || ""}
              placeholder="Store / vendor"
              style={{ border: "none", background: "transparent", padding: "0.1rem 0", fontWeight: 600, fontSize: "0.85rem", flex: 1 }}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => {
                if (e.target.value !== (receipt.vendor || "")) {
                  startTransition(() => updateReceiptVendor(receipt.id, e.target.value));
                }
              }}
            />
            <span className={`status-pill ${statusClass}`}>{statusLabel}</span>
          </div>
          <div className="receipt-card-stats">
            {fmtDate(receipt.uploadedAt)}
            {isPdf ? " · PDF" : ""} ·{" "}
            {items.length
              ? `${items.length} item${items.length === 1 ? "" : "s"} — ${pending.length} to review`
              : receipt.status === "processing"
                ? "scanning…"
                : "no items extracted yet"}
          </div>
        </div>
      </div>
      {open ? (
        <div className="receipt-card-body">
          {receipt.ocrError ? (
            <div style={{ fontSize: "0.74rem", color: "var(--warn)", marginBottom: "0.5rem" }}>{receipt.ocrError}</div>
          ) : null}
          <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.5rem" }}>
            <button
              className="link-btn"
              disabled={rescanning}
              onClick={async () => {
                setRescanning(true);
                await rescanReceipt(receipt.id);
                setRescanning(false);
              }}
            >
              {rescanning ? "Scanning…" : items.length ? "Re-scan" : isPdf ? "Read PDF" : "Run OCR"}
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
          {items.length ? (
            <div style={{ marginTop: "0.5rem" }}>
              {items.map((item) => (
                <ReceiptLineItemRow key={item.id} item={item} sortedDetails={sortedDetails} rooms={rooms} />
              ))}
            </div>
          ) : null}
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

// Shared by pending and dismissed items — both are still "not yet finally
// decided" states, so both get an editable description/amount and the
// ability to assign to a Detail. Once assigned, a real LineItem exists
// elsewhere and this row becomes a read-only summary of that decision.
function EditableReceiptFields({ item }: { item: ReceiptLineItem }) {
  const [, startTransition] = useTransition();
  return (
    <>
      <input
        defaultValue={item.description}
        style={{ fontWeight: 600, padding: "0.1rem 0.3rem", marginBottom: "0.2rem" }}
        onBlur={(e) => {
          if (e.target.value.trim() && e.target.value !== item.description) {
            startTransition(() => updateReceiptLineItem(item.id, { description: e.target.value.trim() }));
          }
        }}
      />
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
        $
        <input
          type="number"
          min={0}
          step="any"
          defaultValue={item.amount}
          style={{ width: "5rem", padding: "0.1rem 0.3rem" }}
          onBlur={(e) => startTransition(() => updateReceiptLineItem(item.id, { amount: e.target.value }))}
        />
      </span>
    </>
  );
}

function ReceiptLineItemRow({
  item,
  sortedDetails,
  rooms,
}: {
  item: ReceiptLineItem;
  sortedDetails: Detail[];
  rooms: Room[];
}) {
  const [, startTransition] = useTransition();

  if (item.status === "assigned") {
    const assignedDetail = sortedDetails.find((d) => d.id === item.assignedDetailId);
    return (
      <div className="list-item" style={{ opacity: 0.8 }}>
        <div className="list-item-main">
          {item.description} — {money(item.amount)}{" "}
          <span style={{ fontSize: "0.7rem", color: "var(--good)" }}>
            ✓ {assignedDetail ? roomPath(rooms, assignedDetail) : ""}
          </span>
        </div>
      </div>
    );
  }

  // pending or dismissed — both editable, both assignable
  return (
    <div className="list-item" style={item.status === "dismissed" ? { opacity: 0.6 } : undefined}>
      <div className="list-item-main">
        <EditableReceiptFields item={item} />
        {item.status === "dismissed" ? (
          <span style={{ fontSize: "0.7rem", marginLeft: "0.4rem" }}>(dismissed)</span>
        ) : null}
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
                {roomPath(rooms, d)}
              </option>
            ))}
          </select>
          {item.status === "pending" ? (
            <button className="secondary" onClick={() => startTransition(() => dismissReceiptLineItem(item.id))}>
              Dismiss
            </button>
          ) : (
            <button className="secondary" onClick={() => startTransition(() => restoreReceiptLineItem(item.id))}>
              Restore to pending
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
