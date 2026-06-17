"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Download, TrendingUp, TrendingDown, Wallet } from "lucide-react";

const COLORS = ["#14b8a6", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6", "#22c55e", "#3b82f6", "#ec4899"];

export default function ReportsPage() {
  const { transactions, invoices, categories } = useAppStore();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  const { chartData, incomeTotal, expenseTotal, netTotal, categoryData } = useMemo(() => {
    const now = new Date();
    let filtered = [...transactions];

    if (period === "daily") {
      const today = now.toISOString().split("T")[0];
      filtered = filtered.filter((t) => t.date === today);
    } else if (period === "weekly") {
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
      filtered = filtered.filter((t) => t.date >= weekAgo);
    } else if (period === "monthly") {
      const month = now.toISOString().slice(0, 7);
      filtered = filtered.filter((t) => t.date.startsWith(month));
    } else {
      const year = String(now.getFullYear());
      filtered = filtered.filter((t) => t.date.startsWith(year));
    }

    const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    const dayMap: Record<string, any> = {};
    filtered.forEach((t) => {
      if (!dayMap[t.date]) dayMap[t.date] = { date: t.date, income: 0, expense: 0 };
      if (t.type === "income") dayMap[t.date].income += t.amount;
      else dayMap[t.date].expense += t.amount;
    });
    const chart = Object.values(dayMap).sort((a: any, b: any) => a.date.localeCompare(b.date));

    const catMap: Record<string, number> = {};
    filtered.forEach((t) => {
      const catName = t.categories?.name || "Lainnya";
      catMap[catName] = (catMap[catName] || 0) + t.amount;
    });
    const catData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    return { chartData: chart, incomeTotal: income, expenseTotal: expense, netTotal: income - expense, categoryData: catData };
  }, [transactions, period]);

  function handleExportCSV() {
    const headers = ["Tanggal", "Tipe", "Kategori", "Deskripsi", "Jumlah", "Dompet"];
    const rows = transactions.map((t) => [
      t.date, t.type, t.categories?.name || "", t.description, t.amount, t.wallets?.name || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${period}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Laporan</h2><p className="text-sm text-slate-500">Analisis keuangan bisnis Anda</p></div>
        <div className="flex gap-2">
          <Select value={period} onChange={(e) => setPeriod(e.target.value as any)} options={[
            { value: "daily", label: "Harian" }, { value: "weekly", label: "Mingguan" },
            { value: "monthly", label: "Bulanan" }, { value: "yearly", label: "Tahunan" },
          ]} />
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download className="w-4 h-4" /> CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-l-4 border-l-emerald-500">
          <p className="text-xs text-slate-500 mb-1">Pemasukan</p>
          <p className="stat-value text-emerald-600 dark:text-emerald-400">{formatCurrency(incomeTotal)}</p>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <p className="text-xs text-slate-500 mb-1">Pengeluaran</p>
          <p className="stat-value text-red-600 dark:text-red-400">{formatCurrency(expenseTotal)}</p>
        </Card>
        <Card className="border-l-4 border-l-teal-500">
          <p className="text-xs text-slate-500 mb-1">Laba Bersih</p>
          <p className={`stat-value ${netTotal >= 0 ? "text-teal-600 dark:text-teal-400" : "text-red-600 dark:text-red-400"}`}>
            {formatCurrency(netTotal)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardTitle>Tren Keuangan</CardTitle>
          {chartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", fontSize: "12px" }} formatter={(v: number) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="income" name="Pemasukan" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-slate-400">Belum ada data</div>
          )}
        </Card>

        <Card>
          <CardTitle>Distribusi Kategori</CardTitle>
          {categoryData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-slate-400">Belum ada data</div>
          )}
        </Card>
      </div>

      <Card>
        <CardTitle>Ringkasan Invoice</CardTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-xs text-slate-500">Total Invoice</p>
            <p className="stat-value text-slate-900 dark:text-white">{invoices.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-slate-500">Lunas</p>
            <p className="stat-value text-emerald-600">{invoices.filter((i) => i.status === "Lunas").length}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-slate-500">Belum Lunas</p>
            <p className="stat-value text-amber-600">{invoices.filter((i) => i.status !== "Lunas").length}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-slate-500">Total Nominal</p>
            <p className="stat-value text-slate-900 dark:text-white">{formatCurrency(invoices.reduce((s, i) => s + i.total, 0))}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
