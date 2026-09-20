import React from "react";

export function Field({ label, htmlFor, children, style }) {
  return (
    <div style={{ marginBottom: "0.7rem", ...style }}>
      {label ? (
        <label htmlFor={htmlFor} style={{ fontSize: "0.7rem", fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--brown-light)", display: "block", marginBottom: "0.5rem" }}>
          {label}
        </label>
      ) : null}
      {children}
    </div>
  );
}
