"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import toast from "react-hot-toast";
import { Plus, Search, Users, Edit3, Trash2, Phone, Mail, MapPin } from "lucide-react";

export default function CustomersPage() {
  const { customers, invoices, fetchCustomers } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", note: "" });

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  function resetForm() { setForm({ name: "", phone: "", email: "", address: "", note: "" }); setEditing(null); }

  function openEdit(c: typeof customers[0]) {
    setForm({ name: c.name, phone: c.phone, email: c.email, address: c.address, note: c.note });
    setEditing(c.id);
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name) return toast.error("Nama harus diisi");
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    if (editing) {
      const { error } = await supabase.from("customers").update(form).eq("id", editing);
      if (error) return toast.error(error.message);
      toast.success("Pelanggan diupdate");
    } else {
      const { error } = await supabase.from("customers").insert({ ...form, user_id: user.id });
      if (error) return toast.error(error.message);
      toast.success("Pelanggan ditambahkan");
    }
    setShowModal(false);
    resetForm();
    fetchCustomers();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus pelanggan ini?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Pelanggan dihapus");
    fetchCustomers();
  }

  function getInvoiceTotal(customerId: string) {
    return invoices.filter((i) => i.customer_id === customerId).reduce((s, i) => s + i.total, 0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Pelanggan</h2><p className="text-sm text-slate-500">{customers.length} pelanggan</p></div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus className="w-4 h-4" /> Tambah Pelanggan</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Cari pelanggan..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-teal-500" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Belum ada pelanggan" description="Tambahkan data pelanggan untuk mulai melacak transaksi."
          action={<Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Tambah</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => {
            const totalInv = getInvoiceTotal(c.id);
            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.phone || "No HP tidak ada"}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Edit3 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </div>
                {c.email && <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Mail className="w-3 h-3" /> {c.email}</p>}
                {c.address && <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><MapPin className="w-3 h-3" /> {c.address}</p>}
                <div className="border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                  <p className="text-xs text-slate-400">Total Invoice: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(totalInv)}</span></p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editing ? "Edit Pelanggan" : "Tambah Pelanggan"}>
        <div className="space-y-4">
          <Input label="Nama" placeholder="Nama pelanggan" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Nomor HP" placeholder="08xxxxxxxxxx" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="Email" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Alamat" placeholder="Alamat lengkap" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          <Input label="Catatan" placeholder="Catatan tambahan" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          <Button className="w-full" onClick={handleSave}>{editing ? "Simpan" : "Tambah"}</Button>
        </div>
      </Modal>
    </div>
  );
}
