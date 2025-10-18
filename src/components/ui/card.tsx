import React from "react";
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...p }) => (
  <div className={`rounded-2xl bg-slate-800/80 border border-slate-700 shadow-lg ${className||""}`} {...p} />
);
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...p }) => (
  <div className={`p-4 ${className||""}`} {...p} />
);
export default Card;
