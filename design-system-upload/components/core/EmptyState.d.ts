import * as React from "react";

/** Centred empty state with a large emoji glyph and one plain sentence explaining what will appear here. */
export interface EmptyStateProps {
  /** A single emoji, matching the page's tab glyph. */
  glyph?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function EmptyState(props: EmptyStateProps): JSX.Element;
