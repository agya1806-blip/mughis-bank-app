"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Invoice, InvoiceItem, BusinessProfile, Customer, PaymentMethod } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Send, Image, FileDown, Printer } from "lucide-react";
import toast from "react-hot-toast";

interface InvoiceDetailProps {
  invoiceId: string;
  onClose: () => void;
  onPay: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function InvoiceDetail({ invoiceId, onClose, onPay, onRefresh }: InvoiceDetailProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [invoiceId]);

  async function loadData() {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const [invRes, itemsRes, profRes, methRes] = await Promise.all([
      supabase.from("invoices").select("*, customers(*)").eq("id", invoiceId).single(),
      supabase.from("invoice_items").select("*").eq("invoice_id", invoiceId),
      supabase.from("business_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("payment_methods").select("*").eq("user_id", user.id).eq("is_active", true),
    ]);

    if (invRes.data) setInvoice(invRes.data as any);
    if (itemsRes.data) setItems(itemsRes.data);
    if (profRes.data) setProfile(profRes.data);
    if (methRes.data) setMethods(methRes.data);
  }

  async function handleCaptureImage() {
    if (!printRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `invoice-${invoice?.invoice_number || "download"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Invoice diunduh sebagai gambar!");
    } catch {
      toast.error("Gagal mengunduh gambar");
    }
  }

  async function handleExportPDF() {
    if (!printRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const canvas = await html2canvas(printRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoice?.invoice_number || "download"}.pdf`);
      toast.success("Invoice diunduh sebagai PDF!");
    } catch {
      toast.error("Gagal mengekspor PDF");
    }
  }

  function handlePrint() {
    window.print();
  }

  if (!invoice) {
    return <div className="text-center py-8 text-slate-400">Memuat...</div>;
  }

  const isLunas = invoice.status === "Lunas";
  const customer = invoice.customers;
  const businessName = profile?.business_name || "MUGHIS BANK";

  return (
    <div>
      <div className="no-print flex gap-2 mb-4 flex-wrap">
        {!isLunas && (
          <Button variant="success" size="sm" onClick={() => onPay(invoiceId)}>
            <CreditCard className="w-4 h-4" /> Tandai Lunas
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={handleCaptureImage}>
          <Image className="w-4 h-4" /> Unduh Slip
        </Button>
        <Button variant="secondary" size="sm" onClick={handleExportPDF}>
          <FileDown className="w-4 h-4" /> Export PDF
        </Button>
        <Button variant="secondary" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4" /> Cetak
        </Button>
      </div>

      <div ref={printRef} className="invoice-template invoice-print-area">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">{businessName}</h1>
            <p className="text-xs text-slate-500 mt-1">{profile?.address}</p>
            {profile?.phone && <p className="text-xs text-slate-500">Telp: {profile.phone}</p>}
            {profile?.email && <p className="text-xs text-slate-500">Email: {profile.email}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-slate-800">INVOICE</h2>
            <p className="text-xs text-slate-500 font-mono mt-1">{invoice.invoice_number}</p>
            <Badge variant={isLunas ? "success" : invoice.status === "DP" ? "warning" : "danger"}>{invoice.status}</Badge>
          </div>
        </div>

        {/* Customer */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Kepada:</p>
            <p className="font-semibold text-slate-800">{customer?.name || invoice.title || "Pelanggan"}</p>
            {customer?.phone && <p className="text-xs text-slate-500">HP: {customer.phone}</p>}
            {customer?.address && <p className="text-xs text-slate-500">{customer.address}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-0.5">Tanggal: {formatDate(invoice.issue_date)}</p>
            <p className="text-xs text-slate-400">Jatuh Tempo: {formatDate(invoice.due_date)}</p>
          </div>
        </div>

        {/* Items */}
        <table className="w-full mb-4">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase">Item</th>
              <th className="text-center py-2 text-xs font-semibold text-slate-500 uppercase w-16">Qty</th>
              <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase w-28">Harga</th>
              <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id || i} className="border-b border-slate-100">
                <td className="py-2 text-sm text-slate-700">{item.name}{item.description && <span className="text-xs text-slate-400 block">{item.description}</span>}</td>
                <td className="py-2 text-sm text-center text-slate-600">{item.quantity}</td>
                <td className="py-2 text-sm text-right text-slate-600">{formatCurrency(item.price)}</td>
                <td className="py-2 text-sm text-right font-semibold text-slate-700">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-1">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            {invoice.discount > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Diskon</span><span className="text-red-500">-{formatCurrency(invoice.discount)}</span></div>}
            {invoice.tax > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Pajak</span><span>{formatCurrency(invoice.tax)}</span></div>}
            <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-1"><span>Total</span><span className="text-teal-600">{formatCurrency(invoice.total)}</span></div>
            {invoice.dp > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">DP</span><span>{formatCurrency(invoice.dp)}</span></div>}
            {!isLunas && invoice.remaining > 0 && <div className="flex justify-between text-sm font-semibold"><span className="text-red-500">Sisa</span><span className="text-red-500">{formatCurrency(invoice.remaining)}</span></div>}
          </div>
        </div>

        {/* Payment Methods */}
        {methods.length > 0 && (
          <div className="mb-6 p-4 border border-slate-200 rounded-lg">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Metode Pembayaran</p>
            <div className="grid grid-cols-2 gap-2">
              {methods.map((m) => (
                <div key={m.id} className="text-xs text-slate-600">
                  <span className="font-semibold">{m.name}</span>
                  {m.account_name && <span> a.n. {m.account_name}</span>}
                  {m.account_number && <span className="block font-mono">{m.account_number}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="text-xs text-slate-400 italic mb-4">
            Catatan: {invoice.notes}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 border-t border-slate-200 pt-4">
          <p>Terima kasih atas kepercayaan Anda</p>
          <p className="font-semibold text-slate-500">{businessName}</p>
        </div>
      </div>
    </div>
  );
}
