import React from "react";

export function ChecklistItem({ checked, onChange, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0.2rem" }}>
      <input type="checkbox" checked={!!checked} onChange={onChange} style={{ width: "auto", accentColor: "var(--terracotta)" }} />
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.9375rem", textDecoration: checked ? "line-through" : "none", color: checked ? "var(--brown-light)" : "var(--brown)" }}>{children}</span>
    </div>
  );
}
