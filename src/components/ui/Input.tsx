import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={generatedId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={generatedId}
          className={twMerge(
            clsx(
              "w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2",
              error
                ? "border-rose-500 focus:ring-rose-400 dark:border-rose-500"
                : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100",
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
