"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table ref={ref} className={cn("w-full text-sm", className)} {...props} />
    </div>
  )
);
Table.displayName = "Table";

export const TableHead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("bg-slate-50 dark:bg-slate-800/50", className)} {...props} />
  )
);
TableHead.displayName = "TableHead";

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("divide-y divide-slate-200 dark:divide-slate-700", className)} {...props} />
  )
);
TableBody.displayName = "TableBody";

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn("hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors", className)} {...props} />
  )
);
TableRow.displayName = "TableRow";

export const TableHeader = forwardRef<HTMLTableHeaderCellElement, HTMLAttributes<HTMLTableHeaderCellElement>>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={cn("table-header", className)} {...props} />
  )
);
TableHeader.displayName = "TableHeader";

export const TableCell = forwardRef<HTMLTableDataCellElement, HTMLAttributes<HTMLTableDataCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("table-cell", className)} {...props} />
  )
);
TableCell.displayName = "TableCell";
