import React from "react";

export function TextLink({ href = "#", children, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a href={href} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", letterSpacing: "0.03em", color: "var(--terracotta)", fontWeight: 500, textDecoration: "none", opacity: hover ? 0.7 : 1, transition: "opacity 0.2s", ...style }} {...rest}>
      {children}
    </a>
  );
}
