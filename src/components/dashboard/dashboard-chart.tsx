"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils/format";

interface DashboardChartProps {
  transactions: Transaction[];
}

export function DashboardChart({ transactions }: DashboardChartProps) {
  const chartData = useMemo(() => {
    const days: { [key: string]: { income: number; expense: number } } = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
      days[key] = { income: 0, expense: 0, label };
    }

    transactions.forEach((t) => {
      if (days[t.date]) {
        if (t.type === "income") days[t.date].income += t.amount;
        else days[t.date].expense += t.amount;
      }
    });

    return Object.entries(days).map(([_, v]) => ({
      name: v.label,
      Pemasukan: v.income,
      Pengeluaran: v.expense,
    }));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-400">
        Belum ada data transaksi
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              padding: "8px 12px",
              fontSize: "12px",
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Bar dataKey="Pemasukan" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
