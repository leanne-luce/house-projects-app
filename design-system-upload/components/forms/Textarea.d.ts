import * as React from "react";

/** Multi-line text control; same box as TextInput. */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  style?: React.CSSProperties;
}
export declare function Textarea(props: TextareaProps): JSX.Element;
