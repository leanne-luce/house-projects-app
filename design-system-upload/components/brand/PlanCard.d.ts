import * as React from "react";

/** A plan in the catalogue grid: 4:3 image that scales 1.04 on hover, tag, Fraunces title, description, text link. No border, no shadow, no radius. */
export interface PlanCardProps {
  /** Category tag — "Woodwork", "Textiles". */
  tag?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Image URL; falls back to the brand's warm timber gradient. */
  image?: string;
  href?: string;
  style?: React.CSSProperties;
}
export declare function PlanCard(props: PlanCardProps): JSX.Element;
