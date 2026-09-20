import React from "react";

export function SandBlock({ title, children, style }) {
  return (
    <div style={{ background: "var(--sand)", padding: "2rem 2rem 2.25rem", ...style }}>
      {title ? <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.125rem", fontWeight: 400, letterSpacing: "-0.01em", color: "var(--brown)", marginBottom: "1.375rem", paddingBottom: "1rem", borderBottom: "1px solid var(--sand-deep)" }}>{title}</h3> : null}
      <div style={{ fontSize: "0.9rem", color: "var(--brown-mid)", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}
