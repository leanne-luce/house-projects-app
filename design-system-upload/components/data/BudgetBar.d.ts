import * as React from "react";

/** Estimated-vs-actual budget bar. Flips to `--danger` when actual exceeds estimate. */
export interface BudgetBarProps {
  label: React.ReactNode;
  value: number;
  max: number;
  /** Formatted money string shown at the right. */
  amount?: React.ReactNode;
  over?: boolean;
  style?: React.CSSProperties;
}
export declare function BudgetBar(props: BudgetBarProps): JSX.Element;
