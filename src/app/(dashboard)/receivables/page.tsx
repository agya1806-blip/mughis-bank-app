"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import toast from "react-hot-toast";
import { Plus, HandCoins, Edit3, Trash2, Search } from "lucide-react";

export default function ReceivablesPage() {
  const { receivables, wallets, fetchReceivables } = useAppStore();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", phone: "", amount: "", description: "", date: new Date().toISOString().split("T")[0],
    due_date: "", wallet_id: wallets[0]?.id || "", status: "Belum Lunas" as "Belum Lunas" | "Lunas",
  });

  const totalReceivable = receivables.filter((r) => r.status === "Belum Lunas").reduce((s, r) => s + r.amount, 0);
  const totalPaid = receivables.filter((r) => r.status === "Lunas").reduce((s, r) => s + r.amount, 0);

  const filtered = receivables.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())
  );

  function resetForm() {
    setForm({ name: "", phone: "", amount: "", description: "", date: new Date().toISOString().split("T")[0], due_date: "", wallet_id: wallets[0]?.id || "", status: "Belum Lunas" });
    setEditing(null);
  }

  async function handleSave() {
    if (!form.name || !form.amount) return toast.error("Nama dan nominal harus diisi");
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const payload = {
      name: form.name, phone: form.phone, amount: Number(form.amount),
      description: form.description, date: form.date, due_date: form.due_date || null,
      wallet_id: form.wallet_id, status: form.status,
    };
    if (editing) {
      await supabase.from("receivables").update(payload).eq("id", editing);
      toast.success("Piutang diupdate");
    } else {
      await supabase.from("receivables").insert({ ...payload, user_id: user.id });
      toast.success("Piutang ditambahkan");
    }
    setShowModal(false);
    resetForm();
    fetchReceivables();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus?")) return;
    await createClient().from("receivables").delete().eq("id", id);
    toast.success("Piutang dihapus");
    fetchReceivables();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Piutang</h2><p className="text-sm text-slate-500">{receivables.length} catatan</p></div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus className="w-4 h-4" /> Tambah Piutang</Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-l-4 border-l-rose-500">
          <p className="text-xs text-slate-500">Belum Lunas</p>
          <p className="stat-value text-rose-600">{formatCurrency(totalReceivable)}</p>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <p className="text-xs text-slate-500">Lunas</p>
          <p className="stat-value text-emerald-600">{formatCurrency(totalPaid)}</p>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Cari piutang..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-teal-500" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Belum ada piutang" description="Catat piutang yang harus diterima." icon={<HandCoins className="w-8 h-8" />}
          action={<Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Tambah</Button>} />
      ) : (
        filtered.map((r) => (
          <Card key={r.id} className="flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200">{r.name}</p>
                <Badge variant={r.status === "Lunas" ? "success" : "danger"}>{r.status}</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{r.description} • {formatDate(r.date)}</p>
              {r.due_date && <p className="text-xs text-red-400 mt-0.5">Jatuh tempo: {formatDate(r.due_date)}</p>}
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(r.amount)}</p>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => { setEditing(r.id); setForm({ name: r.name, phone: r.phone, amount: String(r.amount), description: r.description, date: r.date, due_date: r.due_date || "", wallet_id: r.wallet_id, status: r.status }); setShowModal(true); }}>
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
          </Card>
        ))
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editing ? "Edit Piutang" : "Tambah Piutang"}>
        <div className="space-y-4">
          <Input label="Nama Peminjam" placeholder="Nama" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Nomor HP" placeholder="08xxxxxxxxxx" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="Nominal (Rp)" type="number" placeholder="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          <Input label="Keterangan" placeholder="Keterangan" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tanggal" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            <Input label="Jatuh Tempo" type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
          </div>
          <Select label="Dompet" value={form.wallet_id} onChange={(e) => setForm((f) => ({ ...f, wallet_id: e.target.value }))} options={wallets.map((w) => ({ value: w.id, label: w.name }))} />
          <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} options={[{ value: "Belum Lunas", label: "Belum Lunas" }, { value: "Lunas", label: "Lunas" }]} />
          <Button className="w-full" onClick={handleSave}>{editing ? "Simpan" : "Tambah"}</Button>
        </div>
      </Modal>
    </div>
  );
}
