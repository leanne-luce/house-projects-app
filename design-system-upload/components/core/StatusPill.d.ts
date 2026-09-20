import * as React from "react";

/** Project-status pill — the app's only status colour vocabulary. */
export interface StatusPillProps {
  status?: "not_started" | "in_progress" | "done" | "on_hold";
  /** Override the default label text. */
  label?: string;
  style?: React.CSSProperties;
}
export declare function StatusPill(props: StatusPillProps): JSX.Element;
