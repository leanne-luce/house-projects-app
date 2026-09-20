import React from "react";
import { controlStyle } from "./TextInput.jsx";

export function Textarea({ style, rows = 2, ...rest }) {
  return <textarea rows={rows} style={{ ...controlStyle, ...style }} {...rest} />;
}
