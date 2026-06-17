"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store/app-store";
import { formatCurrency } from "@/lib/utils/format";
import { generateAISummary } from "@/lib/utils/ai";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardChart } from "@/components/dashboard/dashboard-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  CreditCard,
  HandCoins,
  ArrowRight,
  Sparkles,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function DashboardPage() {
  const { transactions, invoices, debts, receivables, wallets, loading } = useAppStore();

  const stats = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

    const paidInvoices = invoices.filter((i) => i.status === "Lunas");
    const unpaidInvoices = invoices.filter((i) => i.status !== "Lunas");
    const paidTotal = paidInvoices.reduce((sum, i) => sum + i.total, 0);
    const unpaidTotal = unpaidInvoices.reduce((sum, i) => sum + i.total, 0);

    const totalDebt = debts.filter((d) => d.status === "Belum Lunas").reduce((sum, d) => sum + d.amount, 0);
    const totalReceivable = receivables.filter((r) => r.status === "Belum Lunas").reduce((sum, r) => sum + r.amount, 0);

    return { income, expense, net: income - expense, totalBalance, paidTotal, unpaidTotal, paidCount: paidInvoices.length, unpaidCount: unpaidInvoices.length, totalDebt, totalReceivable };
  }, [transactions, invoices, debts, receivables, wallets]);

  const aiSummary = useMemo(() => {
    if (transactions.length === 0) return null;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const lastMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      const last = new Date(currentYear, currentMonth - 1, 1);
      return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
    });

    const thisIncome = thisMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const thisExpense = thisMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const lastIncome = lastMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0) || 1;
    const lastExpense = lastMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0) || 1;

    return generateAISummary({
      income: thisIncome,
      expense: thisExpense,
      incomeChange: ((thisIncome - lastIncome) / lastIncome) * 100,
      expenseChange: ((thisExpense - lastExpense) / lastExpense) * 100,
    });
  }, [transactions]);

  const quickLinks = [
    { href: "/finance", label: "Tambah Transaksi", icon: Plus, color: "bg-teal-500" },
    { href: "/invoices", label: "Buat Invoice", icon: FileText, color: "bg-indigo-500" },
    { href: "/customers", label: "Tambah Pelanggan", icon: TrendingUp, color: "bg-emerald-500" },
    { href: "/wallets", label: "Dompet", icon: Wallet, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      {aiSummary && (
        <Card variant="glass" className="border-teal-200/50 dark:border-teal-800/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                AI Financial Insight
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {aiSummary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Balance & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card variant="gradient" className="lg:col-span-2">
          <p className="text-sm text-teal-100 font-medium">Total Saldo</p>
          <p className="text-3xl md:text-4xl font-extrabold font-heading mt-1 text-white">
            {formatCurrency(stats.totalBalance)}
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-xs text-teal-100">Pemasukan</p>
              <p className="text-lg font-bold text-white mt-0.5 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 text-teal-200" />
                {formatCurrency(stats.income)}
              </p>
            </div>
            <div>
              <p className="text-xs text-teal-100">Pengeluaran</p>
              <p className="text-lg font-bold text-white mt-0.5 flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4 text-teal-200" />
                {formatCurrency(stats.expense)}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="h-full flex flex-col items-center justify-center text-center p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className={`w-10 h-10 rounded-xl ${link.color} flex items-center justify-center mb-2`}>
                  <link.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{link.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-teal-500">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Laba Bersih</span>
          </div>
          <p className="stat-value text-teal-600 dark:text-teal-400">{formatCurrency(stats.net)}</p>
        </Card>
        <Card className="border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-medium">Invoice Lunas</span>
          </div>
          <p className="stat-value text-indigo-600 dark:text-indigo-400">{formatCurrency(stats.paidTotal)}</p>
          <p className="text-xs text-slate-400 mt-0.5">{stats.paidCount} invoice</p>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs font-medium">Hutang</span>
          </div>
          <p className="stat-value text-amber-600 dark:text-amber-400">{formatCurrency(stats.totalDebt)}</p>
        </Card>
        <Card className="border-l-4 border-l-rose-500">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
            <HandCoins className="w-4 h-4" />
            <span className="text-xs font-medium">Piutang</span>
          </div>
          <p className="stat-value text-rose-600 dark:text-rose-400">{formatCurrency(stats.totalReceivable)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardTitle>Grafik Keuangan 7 Hari</CardTitle>
            <DashboardChart transactions={transactions} />
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <RecentActivity transactions={transactions.slice(0, 5)} invoices={invoices.slice(0, 5)} />
          </Card>
        </div>
      </div>

      {/* Invoice Summary */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="mb-0">Ringkasan Invoice</CardTitle>
          <Link href="/invoices">
            <Button variant="ghost" size="sm">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Invoice</p>
            <p className="stat-value text-slate-900 dark:text-white">{invoices.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-slate-500 dark:text-slate-400">Lunas</p>
            <p className="stat-value text-emerald-600 dark:text-emerald-400">{stats.paidCount}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-slate-500 dark:text-slate-400">Belum Lunas</p>
            <p className="stat-value text-amber-600 dark:text-amber-400">{stats.unpaidCount}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Belum Lunas</p>
            <p className="stat-value text-red-600 dark:text-red-400">{formatCurrency(stats.unpaidTotal)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
