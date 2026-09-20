import React from "react";

export function Eyebrow({ tone = "faint", children, style }) {
  return (
    <p style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: tone === "brass" ? "var(--brass)" : "var(--brown-light)", lineHeight: 1.6, ...style }}>
      {children}
    </p>
  );
}
