import React from "react";

export function EmptyState({ glyph, children, style }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--brown-mid)", ...style }}>
      {glyph ? <div style={{ fontSize: "2.2rem", marginBottom: "0.6rem" }}>{glyph}</div> : null}
      <div style={{ fontSize: "1rem", lineHeight: 1.75, textWrap: "pretty", maxWidth: "34rem", margin: "0 auto" }}>{children}</div>
    </div>
  );
}
