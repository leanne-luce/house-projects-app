import * as React from "react";

/** Second-level nav: outlined pills for picking which house a per-house view shows. Renders nothing with fewer than two houses. */
export interface HouseTabsProps {
  houses: { id: string; name: string }[];
  active?: string;
  onSelect?: (id: string) => void;
  style?: React.CSSProperties;
}
export declare function HouseTabs(props: HouseTabsProps): JSX.Element | null;
