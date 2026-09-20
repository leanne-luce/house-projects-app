import React from "react";

export function BudgetBar({ label, value, max, amount, over, style }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", ...style }}>
      <div style={{ width: "5.2rem", fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brown-light)", flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: "0.5rem", background: "var(--sand)", borderRadius: 0, overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", borderRadius: 0, background: over ? "var(--terracotta)" : "var(--brass)", transition: "width .35s ease" }} />
      </div>
      <div style={{ minWidth: "4.2rem", textAlign: "right", fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 400, flexShrink: 0, color: over ? "var(--terracotta)" : "var(--brown)" }}>{amount}</div>
    </div>
  );
}
