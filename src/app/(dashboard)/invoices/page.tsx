"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate, generateInvoiceNumber, formatPhone } from "@/lib/utils/format";
import { generateWhatsAppMessage } from "@/lib/utils/ai";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { InvoiceDetail } from "@/components/invoice/invoice-detail";
import { cn } from "@/lib/utils/cn";
import toast from "react-hot-toast";
import {
  Plus,
  FileText,
  Search,
  Eye,
  Download,
  Share2,
  Image,
  FileDown,
  Trash2,
  Send,
  Printer,
  CreditCard,
} from "lucide-react";

export default function InvoicesPage() {
  const router = useRouter();
  const { invoices, customers, paymentMethods, businessProfile, fetchInvoices } = useAppStore();
  const [tab, setTab] = useState<"all" | "unpaid" | "paid">("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [items, setItems] = useState<{ name: string; qty: number; price: number }[]>([{ name: "", qty: 1, price: 0 }]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_id: "",
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    type: "umum" as "print" | "laptop" | "umum",
    status: "Belum Lunas" as "Belum Lunas" | "DP" | "Lunas",
    discount: 0,
    tax: 0,
    dp: 0,
    notes: "",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  });

  const [specs, setSpecs] = useState({
    print: { book_size: "", binding: "Lem Panas", final_size: "", paper_type: "", cover_type: "", laminating: "Tidak", wrapping: "Tidak" },
    laptop: { laptop_name: "", processor: "", ram: "", storage: "", screen: "", condition: "Baik", warranty: "" },
    umum: { trans_type: "", description: "" },
  });

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items]);
  const total = useMemo(() => subtotal - form.discount + form.tax, [subtotal, form.discount, form.tax]);
  const remaining = useMemo(() => total - form.dp, [total, form.dp]);

  const filtered = useMemo(() => {
    let list = [...invoices];
    if (tab === "paid") list = list.filter((i) => i.status === "Lunas");
    if (tab === "unpaid") list = list.filter((i) => i.status !== "Lunas");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.invoice_number.toLowerCase().includes(q) || i.customers?.name?.toLowerCase().includes(q));
    }
    return list;
  }, [invoices, tab, search]);

  function resetForm() {
    setForm({
      customer_id: "", customer_name: "", customer_phone: "", customer_address: "",
      type: "umum", status: "Belum Lunas", discount: 0, tax: 0, dp: 0,
      notes: "", issue_date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    });
    setItems([{ name: "", qty: 1, price: 0 }]);
    setSpecs({
      print: { book_size: "", binding: "Lem Panas", final_size: "", paper_type: "", cover_type: "", laminating: "Tidak", wrapping: "Tidak" },
      laptop: { laptop_name: "", processor: "", ram: "", storage: "", screen: "", condition: "Baik", warranty: "" },
      umum: { trans_type: "", description: "" },
    });
    setEditingId(null);
  }

  function selectCustomer(id: string) {
    const c = customers.find((c) => c.id === id);
    if (c) setForm((f) => ({ ...f, customer_id: id, customer_name: c.name, customer_phone: c.phone, customer_address: c.address }));
  }

  function addItem() { setItems((i) => [...i, { name: "", qty: 1, price: 0 }]); }

  function updateItem(index: number, field: string, value: any) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleTypeSelect(type: "print" | "laptop" | "umum") {
    setForm((f) => ({ ...f, type }));
    setShowTypeModal(false);
    resetForm();
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.customer_name || items.some((i) => !i.name)) {
      return toast.error("Lengkapi nama pelanggan dan semua item");
    }
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const invoiceNumber = generateInvoiceNumber();
    const invoiceData = {
      user_id: user.id,
      customer_id: form.customer_id || null,
      invoice_number: editingId ? undefined : invoiceNumber,
      type: form.type,
      status: form.status,
      subtotal,
      discount: form.discount,
      tax: form.tax,
      total,
      dp: form.dp,
      remaining,
      notes: form.notes,
      issue_date: form.issue_date,
      due_date: form.due_date,
      title: `Invoice ${form.customer_name}`,
    };

    if (editingId) {
      const { error } = await supabase.from("invoices").update(invoiceData).eq("id", editingId);
      if (error) return toast.error(error.message);
      await supabase.from("invoice_items").delete().eq("invoice_id", editingId);
      for (const item of items) {
        await supabase.from("invoice_items").insert({ invoice_id: editingId, name: item.name, quantity: item.qty, price: item.price, total: item.qty * item.price });
      }
      toast.success("Invoice diupdate");
    } else {
      const { data, error } = await supabase.from("invoices").insert(invoiceData).select().single();
      if (error || !data) return toast.error(error?.message || "Gagal membuat invoice");
      for (const item of items) {
        await supabase.from("invoice_items").insert({ invoice_id: data.id, name: item.name, quantity: item.qty, price: item.price, total: item.qty * item.price });
      }
      toast.success("Invoice berhasil dibuat!");
    }

    setShowModal(false);
    resetForm();
    fetchInvoices();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus invoice ini?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Invoice dihapus");
    fetchInvoices();
  }

  async function handlePay(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("invoices").update({ status: "Lunas", dp: total, remaining: 0 }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Invoice ditandai Lunas!");
    fetchInvoices();
  }

  function handleShareWA(invoice: typeof invoices[0]) {
    const msg = generateWhatsAppMessage({
      invoice_number: invoice.invoice_number,
      customer_name: invoice.customers?.name || "Pelanggan",
      total: invoice.total,
      status: invoice.status,
    });
    const phone = invoice.customers?.phone ? formatPhone(invoice.customers.phone) : "";
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${msg}`, "_blank");
    }
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case "Lunas": return "success" as const;
      case "DP": return "warning" as const;
      default: return "danger" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Invoice</h2>
          <p className="text-sm text-slate-500">Kelola faktur dan tagihan pelanggan</p>
        </div>
        <Button onClick={() => setShowTypeModal(true)}>
          <Plus className="w-4 h-4" /> Buat Invoice
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          {(["all", "unpaid", "paid"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
                tab === t ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
              )}>
              {t === "all" ? "Semua" : t === "paid" ? "Lunas" : "Belum Lunas"}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Cari invoice..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-teal-500" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState title="Belum ada invoice" description="Buat invoice pertama Anda untuk mulai menagih." icon={<FileText className="w-8 h-8" />}
            action={<Button onClick={() => setShowTypeModal(true)}><Plus className="w-4 h-4" /> Buat Invoice</Button>} />
        ) : (
          filtered.map((inv) => (
            <Card key={inv.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">{inv.invoice_number}</span>
                    <Badge variant={statusVariant(inv.status)}>{inv.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{inv.customers?.name || "Tanpa pelanggan"}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>Tgl: {formatDate(inv.issue_date)}</span>
                    <span>Jatuh tempo: {formatDate(inv.due_date)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(inv.total)}</p>
                  {inv.status !== "Lunas" && inv.remaining > 0 && (
                    <p className="text-xs text-red-500">Sisa: {formatCurrency(inv.remaining)}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <Button variant="ghost" size="sm" onClick={() => setShowDetail(inv.id)}><Eye className="w-4 h-4" /> Detail</Button>
                <Button variant="ghost" size="sm" onClick={() => handleShareWA(inv)}><Send className="w-4 h-4" /> WA</Button>
                {inv.status !== "Lunas" && (
                  <Button variant="success" size="sm" onClick={() => handlePay(inv.id)}><CreditCard className="w-4 h-4" /> Bayar</Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleDelete(inv.id)} className="ml-auto">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Type Selection Modal */}
      <Modal open={showTypeModal} onClose={() => setShowTypeModal(false)} title="Pilih Jenis Invoice" size="sm">
        <div className="space-y-3">
          <Button className="w-full justify-start" variant="outline" onClick={() => handleTypeSelect("print")}>
            📚 Percetakan Buku
          </Button>
          <Button className="w-full justify-start" variant="outline" onClick={() => handleTypeSelect("laptop")}>
            💻 Laptop Bekas
          </Button>
          <Button className="w-full justify-start" variant="outline" onClick={() => handleTypeSelect("umum")}>
            🛒 Umum
          </Button>
        </div>
      </Modal>

      {/* Invoice Form Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? "Edit Invoice" : "Invoice Baru"} size="xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <Select label="Pelanggan" value={form.customer_id} onChange={(e) => selectCustomer(e.target.value)} placeholder="Pilih pelanggan"
            options={customers.map((c) => ({ value: c.id, label: c.name }))} />
          <Input label="Nama" value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} />
          <Input label="Nomor HP" value={form.customer_phone} onChange={(e) => setForm((f) => ({ ...f, customer_phone: e.target.value }))} />
          <Input label="Alamat" value={form.customer_address} onChange={(e) => setForm((f) => ({ ...f, customer_address: e.target.value }))} />

          {form.type === "print" && (
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="font-semibold text-sm">Spesifikasi Buku</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Ukuran Buku" value={specs.print.book_size} onChange={(e) => setSpecs((s) => ({ ...s, print: { ...s.print, book_size: e.target.value } }))} />
                <Select label="Jenis Jilid" value={specs.print.binding} onChange={(e) => setSpecs((s) => ({ ...s, print: { ...s.print, binding: e.target.value } }))} options={[{ value: "Lem Panas", label: "Lem Panas" }, { value: "Spiral", label: "Spiral" }]} />
                <Input label="Ukuran Jadi" value={specs.print.final_size} onChange={(e) => setSpecs((s) => ({ ...s, print: { ...s.print, final_size: e.target.value } }))} />
                <Input label="Kertas Isi" value={specs.print.paper_type} onChange={(e) => setSpecs((s) => ({ ...s, print: { ...s.print, paper_type: e.target.value } }))} />
                <Input label="Kertas Cover" value={specs.print.cover_type} onChange={(e) => setSpecs((s) => ({ ...s, print: { ...s.print, cover_type: e.target.value } }))} />
                <Select label="Laminating" value={specs.print.laminating} onChange={(e) => setSpecs((s) => ({ ...s, print: { ...s.print, laminating: e.target.value } }))} options={[{ value: "Tidak", label: "Tidak" }, { value: "Glossy", label: "Glossy" }, { value: "Doff", label: "Doff" }]} />
                <Select label="Wrapping" value={specs.print.wrapping} onChange={(e) => setSpecs((s) => ({ ...s, print: { ...s.print, wrapping: e.target.value } }))} options={[{ value: "Tidak", label: "Tidak" }, { value: "Ya", label: "Ya" }]} />
              </div>
            </div>
          )}

          {form.type === "laptop" && (
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="font-semibold text-sm">Spesifikasi Laptop</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nama Laptop" value={specs.laptop.laptop_name} onChange={(e) => setSpecs((s) => ({ ...s, laptop: { ...s.laptop, laptop_name: e.target.value } }))} />
                <Input label="Processor" value={specs.laptop.processor} onChange={(e) => setSpecs((s) => ({ ...s, laptop: { ...s.laptop, processor: e.target.value } }))} />
                <Input label="RAM" value={specs.laptop.ram} onChange={(e) => setSpecs((s) => ({ ...s, laptop: { ...s.laptop, ram: e.target.value } }))} />
                <Input label="Penyimpanan" value={specs.laptop.storage} onChange={(e) => setSpecs((s) => ({ ...s, laptop: { ...s.laptop, storage: e.target.value } }))} />
                <Input label="Ukuran Layar" value={specs.laptop.screen} onChange={(e) => setSpecs((s) => ({ ...s, laptop: { ...s.laptop, screen: e.target.value } }))} />
                <Select label="Kondisi" value={specs.laptop.condition} onChange={(e) => setSpecs((s) => ({ ...s, laptop: { ...s.laptop, condition: e.target.value } }))} options={[{ value: "Like New", label: "Like New" }, { value: "Baik", label: "Baik" }, { value: "Cukup", label: "Cukup" }]} />
                <Input label="Garansi" value={specs.laptop.warranty} onChange={(e) => setSpecs((s) => ({ ...s, laptop: { ...s.laptop, warranty: e.target.value } }))} />
              </div>
            </div>
          )}

          {form.type === "umum" && (
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="font-semibold text-sm">Keterangan Umum</p>
              <Input label="Jenis Transaksi" value={specs.umum.trans_type} onChange={(e) => setSpecs((s) => ({ ...s, umum: { ...s.umum, trans_type: e.target.value } }))} />
              <Input label="Deskripsi" value={specs.umum.description} onChange={(e) => setSpecs((s) => ({ ...s, umum: { ...s.umum, description: e.target.value } }))} />
            </div>
          )}

          <Input label="Catatan" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm">Daftar Item</p>
              <Button variant="secondary" size="sm" onClick={addItem}><Plus className="w-4 h-4" /> Item</Button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2 items-end">
                <div className="flex-1">
                  <Input placeholder="Nama item" value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} />
                </div>
                <div className="w-20">
                  <Input type="number" placeholder="Qty" value={item.qty} onChange={(e) => updateItem(i, "qty", Number(e.target.value))} />
                </div>
                <div className="w-28">
                  <Input type="number" placeholder="Harga" value={item.price} onChange={(e) => updateItem(i, "price", Number(e.target.value))} />
                </div>
                <div className="w-24 text-sm font-semibold text-slate-700 dark:text-slate-300 py-2.5 text-right">
                  {formatCurrency(item.qty * item.price)}
                </div>
                {items.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeItem(i)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-semibold">{formatCurrency(subtotal)}</span></div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Diskon</span>
              <input type="number" className="w-28 px-2 py-1 rounded-lg border text-sm" value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: Number(e.target.value) }))} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Pajak</span>
              <input type="number" className="w-28 px-2 py-1 rounded-lg border text-sm" value={form.tax} onChange={(e) => setForm((f) => ({ ...f, tax: Number(e.target.value) }))} />
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span className="text-teal-600">{formatCurrency(total)}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Uang Muka (DP)" type="number" value={form.dp} onChange={(e) => setForm((f) => ({ ...f, dp: Number(e.target.value) }))} />
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1.5">Sisa</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(remaining)}</p>
            </div>
          </div>

          <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} options={[
            { value: "Belum Lunas", label: "Belum Lunas" },
            { value: "DP", label: "DP (Uang Muka)" },
            { value: "Lunas", label: "Lunas" },
          ]} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Tanggal" type="date" value={form.issue_date} onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))} />
            <Input label="Jatuh Tempo" type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
          </div>

          <Button className="w-full" onClick={handleSave}>
            {editingId ? "Simpan Perubahan" : "Buat Invoice"}
          </Button>
        </div>
      </Modal>

      {/* Invoice Detail Modal */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title="Detail Invoice" size="xl">
        {showDetail && <InvoiceDetail invoiceId={showDetail} onClose={() => setShowDetail(null)} onPay={handlePay} onRefresh={fetchInvoices} />}
      </Modal>
    </div>
  );
}
