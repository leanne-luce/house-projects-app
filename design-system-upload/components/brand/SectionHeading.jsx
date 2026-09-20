import React from "react";
import { Eyebrow } from "./Eyebrow.jsx";

export function SectionHeading({ label, children, action, level = 2, style }) {
  const Tag = "h" + level;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "3.25rem", ...style }}>
      <div>
        {label ? <Eyebrow style={{ marginBottom: "0.625rem" }}>{label}</Eyebrow> : null}
        <Tag style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem,3vw,2.5rem)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.15, color: "var(--brown)", margin: 0 }}>{children}</Tag>
      </div>
      {action}
    </div>
  );
}
