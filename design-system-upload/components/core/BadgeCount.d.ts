import * as React from "react";

/** Small accent count bubble that trails a label (unfiled inbox items, detail counts). */
export interface BadgeCountProps {
  count: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function BadgeCount(props: BadgeCountProps): JSX.Element;
