import React from "react";

export function TabNav({ tabs = [], active, onSelect, style }) {
  return (
    <nav style={{ display: "flex", gap: "0.25rem", background: "var(--sand)", padding: "0.25rem", borderRadius: "999px", overflowX: "auto", maxWidth: "100%", minWidth: 0, ...style }}>
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onSelect && onSelect(t.id)}
            style={{
              border: "none",
              background: isActive ? "var(--cream)" : "transparent",
              color: isActive ? "var(--terracotta)" : "var(--brown-mid)",
              boxShadow: "none",
              fontFamily: "var(--font-sans)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              padding: "0.45rem 0.85rem",
              borderRadius: "999px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
