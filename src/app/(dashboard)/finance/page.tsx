"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { suggestCategory } from "@/lib/utils/ai";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import toast from "react-hot-toast";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Edit3,
  Trash2,
  Sparkles,
  ArrowUpDown,
  Search,
} from "lucide-react";

export default function FinancePage() {
  const { transactions, categories, wallets, fetchTransactions, fetchWallets } = useAppStore();
  const [tab, setTab] = useState<"all" | "income" | "expense">("all");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [form, setForm] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    category_id: "",
    wallet_id: "",
    date: new Date().toISOString().split("T")[0],
  });

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  const filtered = useMemo(() => {
    let items = [...transactions];
    if (tab === "income") items = items.filter((t) => t.type === "income");
    if (tab === "expense") items = items.filter((t) => t.type === "expense");
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((t) => t.description.toLowerCase().includes(q) || t.categories?.name.toLowerCase().includes(q));
    }
    items.sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return items;
  }, [transactions, tab, search, sortOrder]);

  const totals = useMemo(() => {
    const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filtered]);

  function resetForm() {
    setForm({
      type: "expense",
      amount: "",
      description: "",
      category_id: "",
      wallet_id: wallets[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
    });
    setEditing(null);
  }

  function openEdit(t: typeof transactions[0]) {
    setForm({
      type: t.type,
      amount: String(t.amount),
      description: t.description,
      category_id: t.category_id,
      wallet_id: t.wallet_id,
      date: t.date,
    });
    setEditing(t.id);
    setShowModal(true);
  }

  function handleAISuggest() {
    if (!form.description) {
      toast.error("Masukkan deskripsi terlebih dahulu");
      return;
    }
    const suggestion = suggestCategory(form.description);
    const targetCategories = suggestion.type === "income" ? incomeCategories : expenseCategories;
    const found = targetCategories.find((c) => c.name.toLowerCase() === suggestion.name.toLowerCase());
    if (found) {
      setForm((f) => ({ ...f, type: suggestion.type, category_id: found.id }));
      toast.success(`Kategori: ${suggestion.name}`);
    }
  }

  async function handleSave() {
    if (!form.amount || !form.category_id || !form.wallet_id || !form.date) {
      toast.error("Lengkapi semua field");
      return;
    }
    const supabase = createClient();
    const amount = Number(form.amount);
    const payload = {
      type: form.type,
      amount,
      description: form.description,
      category_id: form.category_id,
      wallet_id: form.wallet_id,
      date: form.date,
    };

    if (editing) {
      const old = transactions.find((t) => t.id === editing);
      const diff = form.type === "expense" ? (old?.amount || 0) - amount : amount - (old?.amount || 0);
      const { error } = await supabase.from("transactions").update(payload).eq("id", editing);
      if (error) return toast.error(error.message);
      if (old) {
        await supabase.rpc("update_wallet_balance", { wallet_id: old.wallet_id, diff: old.type === "income" ? -old.amount : old.amount });
      }
      await supabase.rpc("update_wallet_balance", { wallet_id: form.wallet_id, diff: form.type === "income" ? amount : -amount });
      toast.success("Transaksi diupdate");
    } else {
      const { error } = await supabase.from("transactions").insert({ ...payload, user_id: (await supabase.auth.getUser()).data.user?.id });
      if (error) return toast.error(error.message);
      await supabase.rpc("update_wallet_balance", { wallet_id: form.wallet_id, diff: form.type === "income" ? amount : -amount });
      toast.success("Transaksi ditambahkan");
    }

    setShowModal(false);
    resetForm();
    fetchTransactions();
    fetchWallets();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus transaksi ini?")) return;
    const supabase = createClient();
    const t = transactions.find((tx) => tx.id === id);
    if (t) {
      await supabase.rpc("update_wallet_balance", { wallet_id: t.wallet_id, diff: t.type === "income" ? -t.amount : t.amount });
    }
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Transaksi dihapus");
    fetchTransactions();
    fetchWallets();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
            Manajemen Keuangan
          </h2>
          <p className="text-sm text-slate-500">Catat pemasukan dan pengeluaran bisnis Anda</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Tambah Transaksi
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-l-4 border-l-emerald-500">
          <p className="text-xs text-slate-500 mb-1">Pemasukan</p>
          <p className="stat-value text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.income)}</p>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <p className="text-xs text-slate-500 mb-1">Pengeluaran</p>
          <p className="stat-value text-red-600 dark:text-red-400">{formatCurrency(totals.expense)}</p>
        </Card>
        <Card className="border-l-4 border-l-teal-500">
          <p className="text-xs text-slate-500 mb-1">Laba/Rugi</p>
          <p className={`stat-value ${totals.net >= 0 ? "text-teal-600 dark:text-teal-400" : "text-red-600 dark:text-red-400"}`}>
            {formatCurrency(totals.net)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          {(["all", "income", "expense"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                tab === t
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {t === "all" ? "Semua" : t === "income" ? "Pemasukan" : "Pengeluaran"}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-teal-500"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}>
          <ArrowUpDown className="w-4 h-4" />
          {sortOrder === "newest" ? "Terbaru" : "Terlama"}
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <EmptyState
            title="Belum ada transaksi"
            description="Tambahkan transaksi pemasukan atau pengeluaran pertama Anda."
            action={<Button onClick={() => { resetForm(); setShowModal(true); }}><Plus className="w-4 h-4" /> Tambah</Button>}
          />
        ) : (
          filtered.map((t) => (
            <Card key={t.id} className="flex items-center gap-4 p-4 hover:shadow-md transition-shadow">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                t.type === "income" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"
              )}>
                {t.type === "income" ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {t.description || "Tanpa keterangan"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={t.type === "income" ? "success" : "danger"} size="sm">
                    {t.categories?.name || "Tanpa kategori"}
                  </Badge>
                  <span className="text-xs text-slate-400">{formatDate(t.date)}</span>
                  <span className="text-xs text-slate-400">• {t.wallets?.name}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={cn(
                  "text-sm font-bold",
                  t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}>
                  {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editing ? "Edit Transaksi" : "Tambah Transaksi"}>
        <div className="space-y-4">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-700 p-1">
            {(["income", "expense"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t, category_id: "" }))}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all text-center",
                  form.type === t
                    ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500"
                )}
              >
                {t === "income" ? "Pemasukan" : "Pengeluaran"}
              </button>
            ))}
          </div>

          <Input label="Tanggal" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />

          <div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="Deskripsi"
                  placeholder="Keterangan transaksi"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="pt-6">
                <Button variant="secondary" size="sm" onClick={handleAISuggest} title="AI Kategorisasi">
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <Select
            label="Kategori"
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            placeholder="Pilih kategori"
            options={(form.type === "income" ? incomeCategories : expenseCategories).map((c) => ({
              value: c.id,
              label: `${c.icon || "📁"} ${c.name}`,
            }))}
          />

          <Input label="Nominal (Rp)" type="number" placeholder="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />

          <Select
            label="Dompet"
            value={form.wallet_id}
            onChange={(e) => setForm((f) => ({ ...f, wallet_id: e.target.value }))}
            placeholder="Pilih dompet"
            options={wallets.map((w) => ({ value: w.id, label: `${w.icon || "💳"} ${w.name} (${formatCurrency(w.balance)})` }))}
          />

          <Button className="w-full" onClick={handleSave}>
            {editing ? "Simpan Perubahan" : "Tambah Transaksi"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
