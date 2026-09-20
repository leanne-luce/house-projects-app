import * as React from "react";

/**
 * The brand's small uppercase kicker — 0.7rem, +0.12em tracking. It sits above almost every heading.
 */
export interface EyebrowProps {
  /** `brass` for a hero kicker, `faint` (default) for section labels and card tags. */
  tone?: "faint" | "brass";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Eyebrow(props: EyebrowProps): JSX.Element;
