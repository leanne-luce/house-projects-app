import React from "react";

export function StatCard({ value, label, tone, style }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.125rem 0.875rem", textAlign: "center", ...style }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 400, letterSpacing: "-0.02em", color: tone === "danger" ? "var(--terracotta)" : "var(--brown)", overflowWrap: "break-word" }}>{value}</div>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brown-light)", marginTop: "0.5rem", lineHeight: 1.4 }}>{label}</div>
    </div>
  );
}
