import * as React from "react";

/** Fixed bottom-right quick-capture button. One per screen, never two. */
export interface FabProps {
  onClick?: () => void;
  label?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Fab(props: FabProps): JSX.Element;
