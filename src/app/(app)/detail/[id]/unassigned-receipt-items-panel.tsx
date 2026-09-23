"use client";

import { useTransition } from "react";
import { fmtDate } from "@/lib/format";
import { assignReceiptLineItem, dismissReceiptLineItem, updateReceiptLineItem } from "@/lib/actions";
import { Panel } from "@/components/panel";
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
    <Panel title={`Unassigned receipt items (${items.length})`} span2>
      {items.map((item) => (
        <div className="list-item" key={item.id}>
          <div className="list-item-main">
            <input
              defaultValue={item.description}
              style={{ fontWeight: 500, marginBottom: "0.5rem" }}
              onBlur={(e) => {
                if (e.target.value.trim() && e.target.value !== item.description) {
                  startTransition(() => updateReceiptLineItem(item.id, { description: e.target.value.trim() }));
                }
              }}
            />
            <div className="field" style={{ maxWidth: "8rem", marginBottom: 0 }}>
              <label className="field-label">Amount</label>
              <input
                type="number"
                min={0}
                step="any"
                defaultValue={item.amount}
                onBlur={(e) => startTransition(() => updateReceiptLineItem(item.id, { amount: e.target.value }))}
              />
            </div>
            <div className="list-item-sub" style={{ marginTop: "0.4rem" }}>
              from receipt {fmtDate(receiptDates[item.receiptId])}
            </div>
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
    </Panel>
  );
}
