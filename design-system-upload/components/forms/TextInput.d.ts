import * as React from "react";

/** Single-line text input. Focus ring is a 2px `--accent` outline, offset 1px. */
export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  style?: React.CSSProperties;
}
export declare function TextInput(props: TextInputProps): JSX.Element;
