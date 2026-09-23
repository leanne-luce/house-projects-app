"use client";

import { useTransition } from "react";
import { Modal } from "@/components/modal";
import { money, num, budgetDeltaLabel } from "@/lib/format";
import { updateHouse } from "@/lib/actions";
import type { houses as housesTable } from "@/db/schema";

type House = typeof housesTable.$inferSelect;
type Rollup = { count: number; rough: number; actual: number };

// Every financial figure for a house lives here instead of on the always-
// visible house-head — purchase price and down payment stay editable
// (moved verbatim from the old header inputs), everything else is a plain
// .totals-strip figure like the one already on the Overview page.
export function FinancialSummaryModal({
  house,
  rollup,
  furniture,
  onClose,
}: {
  house: House;
  rollup: Rollup;
  furniture: Rollup;
  onClose: () => void;
}) {
  const [, startTransition] = useTransition();
  const purchasePrice = num(house.purchasePrice);
  const downPayment = num(house.downPayment);
  const delta = budgetDeltaLabel(rollup.actual, rollup.rough);

  return (
    <Modal title={`Financial summary — ${house.name}`} onClose={onClose}>
      <div className="field-row">
        <div className="field">
          <label className="field-label">Purchase price</label>
          <input
            type="number"
            min={0}
            step="any"
            defaultValue={house.purchasePrice || ""}
            placeholder="Purchase price"
            onBlur={(e) => {
              if (e.target.value !== (house.purchasePrice || "")) {
                startTransition(() =>
                  updateHouse(house.id, { purchasePrice: e.target.value === "" ? null : e.target.value })
                );
              }
            }}
          />
        </div>
        <div className="field">
          <label className="field-label">Down payment</label>
          <input
            type="number"
            min={0}
            step="any"
            defaultValue={house.downPayment || ""}
            placeholder="Down payment"
            onBlur={(e) => {
              if (e.target.value !== (house.downPayment || "")) {
                startTransition(() =>
                  updateHouse(house.id, { downPayment: e.target.value === "" ? null : e.target.value })
                );
              }
            }}
          />
        </div>
      </div>

      <div className="totals-strip" style={{ marginTop: "0.6rem" }}>
        <div className="tot">
          Spent
          <b>{money(rollup.actual)}</b>
        </div>
        <div className="tot">
          Planned
          <b>{money(rollup.rough)}</b>
        </div>
        {delta ? (
          <div className="tot">
            Budget
            <b style={{ color: delta.over ? "var(--danger)" : undefined }}>{delta.text}</b>
          </div>
        ) : null}
        {furniture.actual ? (
          <div className="tot">
            Furniture spend
            <b>{money(furniture.actual)}</b>
          </div>
        ) : null}
      </div>

      {purchasePrice ? (
        <div className="totals-strip" style={{ marginTop: "0.6rem" }}>
          <div className="tot">
            All-in so far
            <b style={{ color: "var(--accent-strong)" }}>{money(purchasePrice + rollup.actual)}</b>
          </div>
          <div className="tot">
            All-in if fully spent as planned
            <b style={{ color: "var(--accent-strong)" }}>{money(purchasePrice + rollup.rough)}</b>
          </div>
        </div>
      ) : null}

      {downPayment ? (
        <div className="totals-strip" style={{ marginTop: "0.6rem" }}>
          <div className="tot">
            Cash in so far
            <b style={{ color: "var(--accent-strong)" }}>{money(downPayment + rollup.actual)}</b>
          </div>
          <div className="tot">
            Cash in if fully spent as planned
            <b style={{ color: "var(--accent-strong)" }}>{money(downPayment + rollup.rough)}</b>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
