"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

const badgeVariants = {
  default: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
  success: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
  danger: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
  info: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-semibold rounded-full",
          size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
          badgeVariants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
