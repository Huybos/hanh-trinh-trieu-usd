import React from "react";
import { twMerge } from "tailwind-merge";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={twMerge("w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500", className)}
      {...props}
    />
  )
);
Input.displayName = "Input";
export default Input;
