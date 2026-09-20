import * as React from "react";

/** Sunken row used for every list inside a panel: materials, spend, over-budget, coming up. */
export interface ListItemProps {
  main?: React.ReactNode;
  /** Secondary line, usually the House › Room › Detail path. */
  sub?: React.ReactNode;
  right?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function ListItem(props: ListItemProps): JSX.Element;
