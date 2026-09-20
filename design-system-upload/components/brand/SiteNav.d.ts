import * as React from "react";

/** The clubluce.com header: Syne wordmark left, uppercase +0.06em links right, hairline sand rule beneath. */
export interface SiteNavProps {
  links: { id: string; label: string }[];
  active?: string;
  onSelect?: (id: string) => void;
  style?: React.CSSProperties;
}
export declare function SiteNav(props: SiteNavProps): JSX.Element;
