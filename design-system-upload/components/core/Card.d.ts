import * as React from "react";

/** The base surface of the system: white card, hairline border, soft double shadow, 14px radius. */
export interface CardProps {
  /** Apply the standard 1rem interior padding. */
  pad?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function Card(props: CardProps): JSX.Element;
