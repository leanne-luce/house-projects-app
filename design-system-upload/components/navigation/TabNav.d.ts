import * as React from "react";

/**
 * Primary app nav: a pill track with the active tab raised on a white chip.
 * @startingPoint section="Navigation" subtitle="Primary pill tab track and house sub-nav" viewport="700x150"
 */
export interface TabNavProps {
  tabs: { id: string; label: React.ReactNode }[];
  active?: string;
  onSelect?: (id: string) => void;
  style?: React.CSSProperties;
}
export declare function TabNav(props: TabNavProps): JSX.Element;
