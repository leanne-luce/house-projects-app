"use client";

import { useTransition } from "react";
import { fmtDate } from "@/lib/format";
import { assignReceiptLineItem, dismissReceiptLineItem, updateReceiptLineItem } from "@/lib/actions";
import type { receiptLineItems as receiptLineItemsTable } from "@/db/schema";

type ReceiptLineItem = typeof receiptLineItemsTable.$inferSelect;

// Browse all pending items across every receipt and pull in whichever
// belong to the Detail you're looking at — the same assign/dismiss action
// as the Receipts tab, just surfaced where you're already working.
export function UnassignedReceiptItemsPanel({
  detailId,
  items,
  receiptDates,
}: {
  detailId: string;
  items: ReceiptLineItem[];
  receiptDates: Record<string, string | null>;
}) {
  const [, startTransition] = useTransition();
  if (!items.length) return null;

  return (
    <div className="panel-card span2">
      <h4>🧾 Unassigned receipt items ({items.length})</h4>
      {items.map((item) => (
        <div className="list-item" key={item.id}>
          <div className="list-item-main">
            <input
              defaultValue={item.description}
              style={{ fontWeight: 600, padding: "0.1rem 0.3rem" }}
              onBlur={(e) => {
                if (e.target.value.trim() && e.target.value !== item.description) {
                  startTransition(() => updateReceiptLineItem(item.id, { description: e.target.value.trim() }));
                }
              }}
            />
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", marginLeft: "0.3rem" }}>
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
            <div className="list-item-sub">from receipt {fmtDate(receiptDates[item.receiptId])}</div>
          </div>
          <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
            <button className="secondary" onClick={() => startTransition(() => assignReceiptLineItem(item.id, detailId))}>
              Assign here
            </button>
            <button className="icon-btn" onClick={() => startTransition(() => dismissReceiptLineItem(item.id))}>
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
