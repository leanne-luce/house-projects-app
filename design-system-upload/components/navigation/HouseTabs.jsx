import React from "react";

export function HouseTabs({ houses = [], active, onSelect, style }) {
  if (houses.length < 2) return null;
  return (
    <nav style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem", ...style }}>
      {houses.map((h) => {
        const isActive = h.id === active;
        return (
          <button
            key={h.id}
            onClick={() => onSelect && onSelect(h.id)}
            style={{
              border: `1.5px solid ${isActive ? "var(--terracotta)" : "var(--sand-deep)"}`,
              background: "transparent",
              color: isActive ? "var(--terracotta)" : "var(--brown-mid)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              padding: "0.35rem 0.8rem",
              borderRadius: 0,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {h.name}
          </button>
        );
      })}
    </nav>
  );
}
