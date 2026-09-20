import React from "react";

const base = { fontFamily: "var(--font-sans)", cursor: "pointer", borderRadius: 0, transition: "background 0.25s ease, color 0.25s ease, border-color 0.25s ease" };

const VARIANTS = {
  primary: { background: "var(--terracotta)", color: "var(--cream)", border: "1.5px solid var(--terracotta)", padding: "0.75rem 1.75rem", fontWeight: 500, fontSize: "0.875rem", letterSpacing: "0.04em" },
  outline: { background: "transparent", color: "var(--brown)", border: "1.5px solid var(--brown)", padding: "0.9rem 2.25rem", fontWeight: 500, fontSize: "0.875rem", letterSpacing: "0.04em" },
  secondary: { background: "var(--sand)", color: "var(--brown)", border: "1.5px solid var(--sand)", padding: "0.7rem 1.5rem", fontWeight: 500, fontSize: "0.875rem", letterSpacing: "0.04em" },
  ghost: { background: "transparent", color: "var(--brown-mid)", border: "1.5px dashed var(--brown-light)", padding: "0.65rem 1.25rem", fontWeight: 400, fontSize: "0.8125rem", letterSpacing: "0.04em" },
  icon: { background: "transparent", border: "none", color: "var(--brown-light)", fontSize: "1rem", padding: "0.25rem 0.5rem" },
  link: { background: "none", border: "none", color: "var(--terracotta)", fontWeight: 500, fontSize: "0.8125rem", letterSpacing: "0.03em", padding: "0.25rem 0" }
};

const HOVER = {
  primary: { background: "var(--brown)", borderColor: "var(--brown)", color: "var(--cream)" },
  outline: { background: "var(--brown)", color: "var(--cream)" },
  secondary: { background: "var(--sand-deep)", borderColor: "var(--sand-deep)" },
  ghost: { borderColor: "var(--terracotta)", color: "var(--terracotta)" },
  icon: { color: "var(--terracotta)" },
  link: { opacity: 0.7 }
};

export function Button({ variant = "primary", disabled, onClick, style, type = "button", children, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...VARIANTS[variant], ...(hover && !disabled ? HOVER[variant] : null), opacity: disabled ? 0.45 : 1, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
