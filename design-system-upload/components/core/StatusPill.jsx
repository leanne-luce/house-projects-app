import React from "react";

const LABELS = { not_started: "Not started", in_progress: "In progress", done: "Done", on_hold: "On hold" };
const TONES = {
  not_started: { background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" },
  in_progress: { background: "var(--warn-soft)", color: "var(--warn)" },
  done: { background: "var(--good-soft)", color: "var(--good)" },
  on_hold: { background: "var(--danger-soft)", color: "var(--danger)" },
};

export function StatusPill({ status = "not_started", label, style }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.6875rem",
        fontWeight: 500,
        padding: "0.2rem 0.6rem",
        borderRadius: "999px",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        whiteSpace: "nowrap",
        ...TONES[status],
        ...style,
      }}
    >
      {label || LABELS[status]}
    </span>
  );
}
