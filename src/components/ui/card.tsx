"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-5 transition-all duration-200",
          variant === "default" && "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm",
          variant === "glass" && "glass-card",
          variant === "gradient" && "gradient-primary text-white",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-bold font-heading mb-4 text-slate-900 dark:text-white", className)} {...props}>
      {children}
    </h3>
  );
}
