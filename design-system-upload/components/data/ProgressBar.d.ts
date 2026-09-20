import * as React from "react";

/** Checklist / room completion bar. Always `--good` green; never carries status colour. */
export interface ProgressBarProps {
  /** 0–100. */
  pct?: number;
  showPct?: boolean;
  style?: React.CSSProperties;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
