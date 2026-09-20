import * as React from "react";

/**
 * A titled panel in the two-column detail/overview grid.
 * @startingPoint section="Layout" subtitle="Titled panel used across Detail and Overview" viewport="700x220"
 */
export interface PanelCardProps {
  /** Small-caps heading; conventionally opens with the page's emoji glyph. */
  title?: React.ReactNode;
  /** Span both columns of the panel grid. */
  span2?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function PanelCard(props: PanelCardProps): JSX.Element;
