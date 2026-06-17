"use client";

import type { Transaction, Invoice } from "@/types";
import { formatCurrency, getRelativeTime } from "@/lib/utils/format";
import { TrendingUp, TrendingDown, FileText } from "lucide-react";

interface RecentActivityProps {
  transactions: Transaction[];
  invoices: Invoice[];
}

export function RecentActivity({ transactions, invoices }: RecentActivityProps) {
  const activities = [
    ...transactions.map((t) => ({
      id: t.id,
      type: t.type,
      title: t.description || "Transaksi",
      amount: t.amount,
      date: t.created_at,
      icon: t.type === "income" ? TrendingUp : TrendingDown,
      color: t.type === "income" ? "text-emerald-500" : "text-red-500",
      bg: t.type === "income" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30",
    })),
    ...invoices.map((i) => ({
      id: i.id,
      type: "invoice" as const,
      title: `Invoice #${i.invoice_number}`,
      amount: i.total,
      date: i.created_at,
      icon: FileText,
      color: "text-indigo-500",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-400">
        Belum ada aktivitas
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div key={activity.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className={`w-9 h-9 rounded-xl ${activity.bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                {activity.title}
              </p>
              <p className="text-xs text-slate-400">
                {getRelativeTime(activity.date)}
              </p>
            </div>
            <p className={`text-sm font-bold ${activity.type === "income" ? "text-emerald-500" : activity.type === "expense" ? "text-red-500" : "text-indigo-500"}`}>
              {activity.type === "income" ? "+" : activity.type === "expense" ? "-" : ""}
              {formatCurrency(activity.amount)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
