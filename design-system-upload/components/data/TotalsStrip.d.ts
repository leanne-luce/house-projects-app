import * as React from "react";

/** Tinted summary band of label/value pairs, sitting above a list it totals. */
export interface TotalsStripProps {
  items: { label: React.ReactNode; value: React.ReactNode; emphasis?: boolean }[];
  style?: React.CSSProperties;
}
export declare function TotalsStrip(props: TotalsStripProps): JSX.Element;
