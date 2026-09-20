import * as React from "react";

/** Small-caps section heading, optionally with a trailing action. */
export interface SectionTitleProps {
  children?: React.ReactNode;
  /** Right-aligned slot, usually a link Button. */
  right?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function SectionTitle(props: SectionTitleProps): JSX.Element;
