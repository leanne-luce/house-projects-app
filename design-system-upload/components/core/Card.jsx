import React from "react";

export function Card({ pad = false, style, children, ...rest }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: pad ? "1.75rem" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
