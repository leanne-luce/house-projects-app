// Shared collapsible wrapper for every card on the Detail page — plain
// <details>/<summary>, open by default (still collapsible if you want a
// panel out of the way), same chevron/uppercase-label pattern already used
// for room cards and receipt cards elsewhere in the app. No client state
// needed just to remember open/closed.
export function Panel({
  id,
  title,
  span2,
  danger,
  defaultOpen = true,
  children,
}: {
  id?: string;
  title: React.ReactNode;
  span2?: boolean;
  danger?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      id={id}
      open={defaultOpen}
      className={`panel-card${span2 ? " span2" : ""}`}
      style={danger ? { borderColor: "var(--danger-soft)" } : undefined}
    >
      <summary style={danger ? { color: "var(--danger)" } : undefined}>{title}</summary>
      {children}
    </details>
  );
}
