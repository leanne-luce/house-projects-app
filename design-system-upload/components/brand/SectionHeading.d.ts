import * as React from "react";

/** Eyebrow + Fraunces heading, with an optional right-aligned text link. The standard opener for any section. */
export interface SectionHeadingProps {
  /** Uppercase kicker above the heading. */
  label?: React.ReactNode;
  /** Right-aligned slot, usually a TextLink. */
  action?: React.ReactNode;
  level?: 1 | 2 | 3;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function SectionHeading(props: SectionHeadingProps): JSX.Element;
