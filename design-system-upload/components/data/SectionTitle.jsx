import React from "react";

export function SectionTitle({ children, right, style }) {
  return (
    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--brown-mid)", marginBottom: "0.875rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", ...style }}>
      <span>{children}</span>
      {right}
    </div>
  );
}
