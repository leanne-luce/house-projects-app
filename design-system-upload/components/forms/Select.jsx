import React from "react";
import { controlStyle } from "./TextInput.jsx";

export function Select({ style, children, ...rest }) {
  return <select style={{ ...controlStyle, ...style }} {...rest}>{children}</select>;
}
