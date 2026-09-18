"use client";

import { useTransition } from "react";
import { money, fmtDate } from "@/lib/format";
import { assignReceiptLineItem, dismissReceiptLineItem } from "@/lib/actions";
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
            {item.description} — {money(item.amount)}
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
