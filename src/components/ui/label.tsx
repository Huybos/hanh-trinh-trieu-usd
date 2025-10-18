import React from "react";
export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...p }) => (
  <label className={`block text-xs mb-1 opacity-80 ${className||""}`} {...p} />
);
export default Label;
