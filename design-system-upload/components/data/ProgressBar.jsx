import React from "react";

export function ProgressBar({ pct = 0, showPct = false, style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", ...style }}>
      <div style={{ flex: 1, height: "0.375rem", background: "var(--sand)", borderRadius: 0, overflow: "hidden" }}>
        <div style={{ height: "100%", width: Math.max(0, Math.min(100, pct)) + "%", background: "var(--good)", borderRadius: 0, transition: "width .35s ease" }} />
      </div>
      {showPct ? <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--brown-mid)", flexShrink: 0, minWidth: "2ch", textAlign: "right" }}>{Math.round(pct)}%</span> : null}
    </div>
  );
}
