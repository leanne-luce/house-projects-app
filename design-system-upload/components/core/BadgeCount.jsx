import React from "react";

export function BadgeCount({ count, style }) {
  return (
    <span style={{ fontFamily: "var(--font-sans)", display: "inline-block", minWidth: "1.1rem", padding: "0 0.3rem", marginLeft: "0.3rem", background: "var(--brass)", color: "var(--cream)", borderRadius: "999px", fontSize: "0.6875rem", lineHeight: "1.1rem", textAlign: "center", ...style }}>
      {count}
    </span>
  );
}
