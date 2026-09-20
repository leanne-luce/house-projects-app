import * as React from "react";

/** One figure in the Overview stat strip. */
export interface StatCardProps {
  value: React.ReactNode;
  label: React.ReactNode;
  /** `danger` turns the figure red — used for over-budget totals. */
  tone?: "default" | "danger";
  style?: React.CSSProperties;
}
export declare function StatCard(props: StatCardProps): JSX.Element;
