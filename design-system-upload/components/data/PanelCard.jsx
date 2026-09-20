import React from "react";

export function PanelCard({ title, span2, children, style }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.75rem", gridColumn: span2 ? "1 / -1" : undefined, ...style }}>
      {title ? (
        <h4 style={{ margin: "0 0 1.25rem", fontSize: "0.7rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--brown-mid)", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: "0.4rem" }}>{title}</h4>
      ) : null}
      {children}
    </div>
  );
}
