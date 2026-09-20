import * as React from "react";

/** Native select, styled to match TextInput. */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  style?: React.CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;
