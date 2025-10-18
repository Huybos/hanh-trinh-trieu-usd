import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "destructive" | "ghost";
};
export const Button: React.FC<Props> = ({ variant="default", className, ...rest }) => {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-95 hover:opacity-90";
  const styles = {
    default: "bg-cyan-600 text-white",
    secondary: "bg-white/10 text-white border border-white/20",
    destructive: "bg-red-600 text-white",
    ghost: "bg-transparent text-inherit hover:bg-white/10"
  }[variant];
  return <button className={twMerge(clsx(base, styles, className))} {...rest} />;
};
export default Button;
