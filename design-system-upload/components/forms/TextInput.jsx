import React from "react";

export const controlStyle = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.9375rem",
  color: "var(--brown)",
  background: "var(--surface)",
  border: "1px solid var(--sand-deep)",
  borderRadius: 0,
  padding: "0.7rem 0.85rem",
  width: "100%",
};

export function TextInput({ style, ...rest }) {
  return (
    <input
      style={{ ...controlStyle, ...style }}
      onFocus={(e) => { e.currentTarget.style.outline = "1.5px solid var(--terracotta)"; e.currentTarget.style.outlineOffset = "1px"; }}
      onBlur={(e) => { e.currentTarget.style.outline = "none"; }}
      {...rest}
    />
  );
}
