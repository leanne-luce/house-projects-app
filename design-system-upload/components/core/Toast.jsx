import React from "react";

export function Toast({ children, style }) {
  return (
    <div style={{ position: "fixed", bottom: "5.2rem", left: "50%", transform: "translateX(-50%)", background: "var(--brown)", color: "var(--cream)", fontFamily: "var(--font-sans)", padding: "0.7rem 1.25rem", borderRadius: 0, fontSize: "0.875rem", letterSpacing: "0.02em", zIndex: 200, ...style }}>
      {children}
    </div>
  );
}
