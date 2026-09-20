import * as React from "react";

/** The Club Luce button. Square, 1.5px rule, sentence case, +0.04em tracking; hover inverts rather than tints. */
export interface ButtonProps {
  /** `outline` is the site's signature call to action; `primary` is the filled terracotta form used in product UI. */
  variant?: "primary" | "outline" | "secondary" | "ghost" | "icon" | "link";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;
