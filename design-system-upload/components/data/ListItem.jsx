import React from "react";

export function ListItem({ main, sub, right, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.6rem", padding: "0.75rem 0.875rem", background: "var(--sand)", borderRadius: 0, marginBottom: "0.375rem", cursor: onClick ? "pointer" : undefined, ...style }}
    >
      <div style={{ minWidth: 0, flex: 1, fontFamily: "var(--font-sans)", fontSize: "0.9375rem", lineHeight: 1.55 }}>
        {main}
        {sub ? <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--brown-mid)", marginTop: "0.25rem" }}>{sub}</div> : null}
      </div>
      {right ? <div style={{ flexShrink: 0 }}>{right}</div> : null}
    </div>
  );
}
