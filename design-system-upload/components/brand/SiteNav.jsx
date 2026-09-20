import React from "react";

export function SiteNav({ links = [], active, onSelect, style }) {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--cream)", borderBottom: "1px solid var(--sand)", padding: "1.25rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", ...style }}>
      <span className="wordmark" style={{ fontFamily: "var(--font-wordmark)", fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--brown)" }}>Club Luce</span>
      <ul style={{ listStyle: "none", display: "flex", alignItems: "center", gap: "2.25rem", margin: 0, padding: 0 }}>
        {links.map((l) => (
          <li key={l.id}>
            <a href="#" onClick={(e) => { e.preventDefault(); onSelect && onSelect(l.id); }}
              style={{ fontSize: "0.8125rem", letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", color: l.id === active ? "var(--terracotta)" : "var(--brown-mid)", transition: "color 0.2s ease" }}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
