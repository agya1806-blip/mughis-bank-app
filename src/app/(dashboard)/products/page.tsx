"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import toast from "react-hot-toast";
import { Plus, Package, Edit3, Trash2, Search, Box, Wrench } from "lucide-react";

export default function ProductsPage() {
  const { products, fetchProducts } = useAppStore();
  const [tab, setTab] = useState<"all" | "product" | "service">("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type: "service" as "product" | "service", category: "Umum", price: 0, stock: 0, unit: "pcs" });

  const filtered = useMemo(() => {
    let items = [...products];
    if (tab === "product") items = items.filter((p) => p.type === "product");
    if (tab === "service") items = items.filter((p) => p.type === "service");
    if (search) items = items.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [products, tab, search]);

  function resetForm() { setForm({ name: "", type: "service", category: "Umum", price: 0, stock: 0, unit: "pcs" }); setEditing(null); }

  async function handleSave() {
    if (!form.name) return toast.error("Nama harus diisi");
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    if (editing) {
      const { error } = await supabase.from("products").update(form).eq("id", editing);
      if (error) return toast.error(error.message);
      toast.success("Item diupdate");
    } else {
      const { error } = await supabase.from("products").insert({ ...form, user_id: user.id });
      if (error) return toast.error(error.message);
      toast.success("Item ditambahkan");
    }
    setShowModal(false);
    resetForm();
    fetchProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus item ini?")) return;
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    toast.success("Item dihapus");
    fetchProducts();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Produk & Jasa</h2><p className="text-sm text-slate-500">{products.length} item</p></div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus className="w-4 h-4" /> Tambah Item</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          {(["all", "product", "service"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
                tab === t ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
              )}>
              {t === "all" ? "Semua" : t === "product" ? "Barang" : "Jasa"}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Cari item..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-teal-500 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Belum ada item" description="Tambahkan produk atau jasa untuk digunakan di invoice."
          action={<Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Tambah</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                    p.type === "product" ? "bg-amber-100 dark:bg-amber-900/30" : "bg-blue-100 dark:bg-blue-900/30")}>
                    {p.type === "product" ? <Box className="w-5 h-5 text-amber-600" /> : <Wrench className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{p.type} • {p.category}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(p.id); setForm({ name: p.name, type: p.type, category: p.category, price: p.price, stock: p.stock, unit: p.unit }); setShowModal(true); }}>
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(p.price)}</p>
              {p.type === "product" && <p className="text-xs text-slate-400 mt-1">Stok: {p.stock} {p.unit}</p>}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editing ? "Edit Item" : "Tambah Item"}>
        <div className="space-y-4">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-700 p-1">
            {(["service", "product"] as const).map((t) => (
              <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={cn("flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  form.type === t ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
                )}>{t === "service" ? "Jasa" : "Barang"}</button>
            ))}
          </div>
          <Input label="Nama" placeholder="Nama produk/jasa" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Select label="Kategori" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            options={[{ value: "Percetakan", label: "Percetakan" }, { value: "Laptop", label: "Laptop" }, { value: "Umum", label: "Umum" }, { value: "Makanan", label: "Makanan" }, { value: "Fashion", label: "Fashion" }]} />
          <Input label="Harga (Rp)" type="number" placeholder="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
          {form.type === "product" && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Stok" type="number" placeholder="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} />
              <Input label="Satuan" placeholder="pcs" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} />
            </div>
          )}
          <Button className="w-full" onClick={handleSave}>{editing ? "Simpan" : "Tambah"}</Button>
        </div>
      </Modal>
    </div>
  );
}
