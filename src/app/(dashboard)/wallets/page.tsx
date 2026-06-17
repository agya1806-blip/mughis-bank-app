"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import toast from "react-hot-toast";
import { Plus, Wallet as WalletIcon, ArrowRightLeft, Trash2, Edit3, PiggyBank } from "lucide-react";

export default function WalletsPage() {
  const { wallets, fetchWallets } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type: "cash" as const, icon: "💳" });
  const [transfer, setTransfer] = useState({ from: "", to: "", amount: "", description: "" });

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);

  async function handleSaveWallet() {
    if (!form.name) return toast.error("Nama dompet harus diisi");
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    if (editing) {
      const { error } = await supabase.from("wallets").update({ name: form.name, type: form.type, icon: form.icon }).eq("id", editing);
      if (error) return toast.error(error.message);
      toast.success("Dompet diupdate");
    } else {
      const { error } = await supabase.from("wallets").insert({ user_id: user.id, name: form.name, type: form.type, icon: form.icon });
      if (error) return toast.error(error.message);
      toast.success("Dompet ditambahkan");
    }

    setShowModal(false);
    setEditing(null);
    setForm({ name: "", type: "cash", icon: "💳" });
    fetchWallets();
  }

  async function handleDeleteWallet(id: string) {
    if (!confirm("Hapus dompet ini?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("wallets").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dompet dihapus");
    fetchWallets();
  }

  async function handleTransfer() {
    if (!transfer.from || !transfer.to || !transfer.amount) return toast.error("Lengkapi semua field");
    if (transfer.from === transfer.to) return toast.error("Dompet asal dan tujuan harus berbeda");
    const amount = Number(transfer.amount);
    if (amount <= 0) return toast.error("Nominal harus lebih dari 0");

    const supabase = createClient();
    await supabase.rpc("update_wallet_balance", { wallet_id: transfer.from, diff: -amount });
    await supabase.rpc("update_wallet_balance", { wallet_id: transfer.to, diff: amount });

    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      await supabase.from("transactions").insert([
        { user_id: user.id, wallet_id: transfer.from, category_id: "", type: "expense", amount, description: `Transfer: ${transfer.description || "Transfer antar dompet"}`, date: new Date().toISOString().split("T")[0] },
        { user_id: user.id, wallet_id: transfer.to, category_id: "", type: "income", amount, description: `Transfer: ${transfer.description || "Transfer antar dompet"}`, date: new Date().toISOString().split("T")[0] },
      ]);
    }

    toast.success("Transfer berhasil!");
    setShowTransfer(false);
    setTransfer({ from: "", to: "", amount: "", description: "" });
    fetchWallets();
  }

  const walletIcons = [
    { value: "💵", label: "💵 Tunai" },
    { value: "🏦", label: "🏦 Bank" },
    { value: "💳", label: "💳 Kartu" },
    { value: "📱", label: "📱 E-Wallet" },
    { value: "💰", label: "💰 Tabungan" },
    { value: "🪙", label: "🪙 Koin" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Dompet</h2>
          <p className="text-sm text-slate-500">Total: {formatCurrency(totalBalance)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowTransfer(true)}>
            <ArrowRightLeft className="w-4 h-4" /> Transfer
          </Button>
          <Button onClick={() => { setEditing(null); setForm({ name: "", type: "cash", icon: "💳" }); setShowModal(true); }}>
            <Plus className="w-4 h-4" /> Tambah Dompet
          </Button>
        </div>
      </div>

      {wallets.length === 0 ? (
        <EmptyState
          title="Belum ada dompet"
          description="Buat dompet untuk mulai melacak keuangan Anda."
          action={<Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Tambah Dompet</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((w) => (
            <Card key={w.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-2xl">
                    {w.icon || "💳"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{w.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{w.type}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(w.id); setForm({ name: w.name, type: w.type as any, icon: w.icon }); setShowModal(true); }}>
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteWallet(w.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <p className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {formatCurrency(w.balance)}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Dompet" : "Tambah Dompet"}>
        <div className="space-y-4">
          <Input label="Nama Dompet" placeholder="Nama dompet" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Select label="Tipe" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))} options={[
            { value: "cash", label: "Tunai" },
            { value: "bank", label: "Bank" },
            { value: "ewallet", label: "E-Wallet" },
          ]} />
          <Select label="Icon" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} options={walletIcons} />
          <Button className="w-full" onClick={handleSaveWallet}>{editing ? "Simpan" : "Tambah"}</Button>
        </div>
      </Modal>

      <Modal open={showTransfer} onClose={() => setShowTransfer(false)} title="Transfer Antar Dompet" size="sm">
        <div className="space-y-4">
          <Select label="Dari Dompet" value={transfer.from} onChange={(e) => setTransfer((f) => ({ ...f, from: e.target.value }))} placeholder="Pilih dompet asal" options={wallets.map((w) => ({ value: w.id, label: `${w.icon} ${w.name} (${formatCurrency(w.balance)})` }))} />
          <div className="text-center text-2xl text-slate-300">⬇️</div>
          <Select label="Ke Dompet" value={transfer.to} onChange={(e) => setTransfer((f) => ({ ...f, to: e.target.value }))} placeholder="Pilih dompet tujuan" options={wallets.map((w) => ({ value: w.id, label: `${w.icon} ${w.name} (${formatCurrency(w.balance)})` }))} />
          <Input label="Nominal (Rp)" type="number" placeholder="0" value={transfer.amount} onChange={(e) => setTransfer((f) => ({ ...f, amount: e.target.value }))} />
          <Input label="Keterangan" placeholder="Keterangan transfer" value={transfer.description} onChange={(e) => setTransfer((f) => ({ ...f, description: e.target.value }))} />
          <Button className="w-full" onClick={handleTransfer}><ArrowRightLeft className="w-4 h-4" /> Transfer</Button>
        </div>
      </Modal>
    </div>
  );
}
