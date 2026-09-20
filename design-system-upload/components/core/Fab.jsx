import React from "react";

export function Fab({ onClick, label = "+", style }) {
  return (
    <button onClick={onClick} aria-label="Quick capture" style={{ position: "fixed", right: "1.1rem", bottom: "1.1rem", zIndex: 50, width: "3.25rem", height: "3.25rem", borderRadius: 0, background: "var(--terracotta)", color: "var(--cream)", border: "none", fontSize: "1.5rem", fontFamily: "var(--font-sans)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
      {label}
    </button>
  );
}
