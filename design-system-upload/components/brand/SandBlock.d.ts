import * as React from "react";

/** A tinted sand panel — the system's only "card". Square, no border, no shadow; the fill alone separates it. */
export interface SandBlockProps {
  /** Fraunces title with a sand-deep rule under it. */
  title?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function SandBlock(props: SandBlockProps): JSX.Element;
