import React from "react";

export function TotalsStrip({ items = [], style }) {
  return (
    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", background: "var(--sand)", borderRadius: 0, padding: "1rem 1.25rem", marginBottom: "0.6rem", ...style }}>
      {items.map((it, i) => (
        <div key={i} style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brown-light)" }}>
          <div>{it.label}</div>
          <b style={{ color: it.emphasis ? "var(--terracotta)" : "var(--brown)", fontFamily: "var(--font-display)", fontSize: "1.25rem", display: "block", fontWeight: 400, letterSpacing: "-0.02em", marginTop: "0.25rem" }}>{it.value}</b>
        </div>
      ))}
    </div>
  );
}
