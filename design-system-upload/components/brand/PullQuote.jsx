import React from "react";

export function PullQuote({ children, style }) {
  return (
    <blockquote style={{ borderLeft: "2px solid var(--brass)", padding: "0.25rem 0 0.25rem 1.75rem", margin: "3rem 0", ...style }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.25rem,2vw,1.625rem)", fontWeight: 300, fontStyle: "italic", color: "var(--brown)", lineHeight: 1.45, margin: 0 }}>{children}</p>
    </blockquote>
  );
}
