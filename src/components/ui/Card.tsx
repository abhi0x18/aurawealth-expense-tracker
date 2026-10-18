import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: "none" | "emerald" | "blue" | "purple";
}

export function Card({ className, hover = true, glow = "none", children, ...props }: CardProps) {
  const glowStyles = {
    none: "",
    emerald: "hover:shadow-emerald-500/15 hover:border-emerald-500/40",
    blue: "hover:shadow-blue-500/15 hover:border-blue-500/40",
    purple: "hover:shadow-purple-500/15 hover:border-purple-500/40",
  }[glow];

  return (
    <div
      className={twMerge(
        clsx(
          "bg-white/85 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-xl transition-all duration-300 relative overflow-hidden",
          hover && "hover:-translate-y-1 hover:shadow-2xl",
          glowStyles,
          className
        )
      )}
      {...props}
    >
      {/* Specular ambient top highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 dark:via-white/15 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
