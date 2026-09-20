import React from "react";

export function SiteFooter({ links = [], style }) {
  return (
    <footer style={{ padding: "3rem 2.5rem", borderTop: "1px solid var(--sand)", ...style }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.25rem" }}>
        <span style={{ fontFamily: "var(--font-wordmark)", fontSize: "1.125rem", fontWeight: 700, color: "var(--brown)" }}>Club Luce</span>
        <p style={{ fontSize: "0.8125rem", color: "var(--brown-light)" }}>&copy; 2025 Club Luce. All rights reserved.</p>
        <ul style={{ display: "flex", gap: "1.5rem", listStyle: "none", margin: 0, padding: 0 }}>
          {links.map((l) => <li key={l}><a href="#" style={{ fontSize: "0.8125rem", color: "var(--brown-light)", textDecoration: "none" }}>{l}</a></li>)}
        </ul>
      </div>
    </footer>
  );
}
