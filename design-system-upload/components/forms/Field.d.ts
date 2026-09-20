import * as React from "react";

/** Label + control wrapper. The label is the system's small-caps field label style. */
export interface FieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Field(props: FieldProps): JSX.Element;
