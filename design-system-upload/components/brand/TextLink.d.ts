import * as React from "react";

/** Terracotta text link with a trailing arrow; fades to 70% on hover rather than underlining. */
export interface TextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
}
export declare function TextLink(props: TextLinkProps): JSX.Element;
