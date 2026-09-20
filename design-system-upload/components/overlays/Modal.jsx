import React from "react";

export function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "var(--scrim)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
    >
      <div style={{ background: "var(--surface)", width: "100%", maxWidth: "38rem", maxHeight: "85vh", overflowY: "auto", borderRadius: 0, border: "1px solid var(--sand-deep)" }}>
        <div style={{ position: "sticky", top: 0, background: "var(--surface)", padding: "1.25rem 1.75rem", borderBottom: "1px solid var(--sand)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.6rem", zIndex: 2 }}>
          <b style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.25rem", letterSpacing: "-0.01em" }}>{title}</b>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", fontSize: "1.3rem", color: "var(--text-faint)", cursor: "pointer", lineHeight: 1, padding: "0.2rem 0.4rem" }}>✕</button>
        </div>
        <div style={{ padding: "1.75rem" }}>{children}</div>
      </div>
    </div>
  );
}
