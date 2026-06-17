"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useThemeStore } from "@/lib/store/theme-store";
import { createClient, exportDb, importDb } from "@/lib/localDb";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import toast from "react-hot-toast";
import { Sun, Moon, LogOut, Building2, Banknote, Plus, Trash2, Sparkles, Download, Upload } from "lucide-react";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { theme, setTheme } = useThemeStore();
  const { businessProfile, paymentMethods, fetchBusinessProfile, fetchPaymentMethods } = useAppStore();

  const [profile, setProfile] = useState({ business_name: "", business_category: "", phone: "", whatsapp: "", email: "", address: "", tax_id: "" });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ type: "bank" as string, name: "", account_name: "", account_number: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (businessProfile) {
      setProfile({
        business_name: businessProfile.business_name || "",
        business_category: businessProfile.business_category || "",
        phone: businessProfile.phone || "",
        whatsapp: businessProfile.whatsapp || "",
        email: businessProfile.email || "",
        address: businessProfile.address || "",
        tax_id: businessProfile.tax_id || "",
      });
    }
  }, [businessProfile]);

  async function handleSaveProfile() {
    setSaving(true);
    const supabase = createClient();
    const userData = (await supabase.auth.getUser()).data.user;
    if (!userData) return;

    const { error } = await supabase.from("business_profiles").upsert({
      user_id: userData.id,
      ...profile,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profil bisnis disimpan!");
    fetchBusinessProfile();
  }

  async function handleAddPayment() {
    if (!paymentForm.name || !paymentForm.account_number) return toast.error("Lengkapi data");
    const supabase = createClient();
    const userData = (await supabase.auth.getUser()).data.user;
    if (!userData) return;

    const { error } = await supabase.from("payment_methods").insert({
      user_id: userData.id,
      type: paymentForm.type,
      name: paymentForm.name,
      account_name: paymentForm.account_name,
      account_number: paymentForm.account_number,
    });
    if (error) return toast.error(error.message);
    toast.success("Metode pembayaran ditambahkan");
    setShowPaymentModal(false);
    setPaymentForm({ type: "bank", name: "", account_name: "", account_number: "" });
    fetchPaymentMethods();
  }

  async function handleDeletePayment(id: string) {
    if (!confirm("Hapus metode pembayaran?")) return;
    const supabase = createClient();
    await supabase.from("payment_methods").delete().eq("id", id);
    toast.success("Metode pembayaran dihapus");
    fetchPaymentMethods();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile */}
      <Card>
        <CardTitle>👤 Profil Pengguna</CardTitle>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-lg font-bold text-teal-600 dark:text-teal-400">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{user?.email || user?.user_metadata?.full_name || "User"}</p>
              <p className="text-xs text-slate-400">Data disimpan di browser (lokal)</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Business Profile */}
      <Card>
        <CardTitle>🏪 Profil Bisnis</CardTitle>
        <div className="space-y-4">
          <Input label="Nama Bisnis" placeholder="Nama usaha Anda" value={profile.business_name}
            onChange={(e) => setProfile((p) => ({ ...p, business_name: e.target.value }))} />
          <Input label="Kategori Usaha" placeholder="Contoh: Percetakan, Laptop, Fashion" value={profile.business_category}
            onChange={(e) => setProfile((p) => ({ ...p, business_category: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nomor Telepon" placeholder="08xxxxxxxxxx" value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            <Input label="WhatsApp" placeholder="08xxxxxxxxxx" value={profile.whatsapp}
              onChange={(e) => setProfile((p) => ({ ...p, whatsapp: e.target.value }))} />
          </div>
          <Input label="Email Bisnis" type="email" placeholder="bisnis@email.com" value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
          <Input label="Alamat" placeholder="Alamat lengkap" value={profile.address}
            onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} />
          <Input label="NPWP/NIK" placeholder="Nomor pajak (opsional)" value={profile.tax_id}
            onChange={(e) => setProfile((p) => ({ ...p, tax_id: e.target.value }))} />
          <Button className="w-full" onClick={handleSaveProfile} loading={saving}>
            💾 Simpan Profil Bisnis
          </Button>
        </div>
      </Card>

      {/* Payment Methods */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="mb-0">💳 Metode Pembayaran</CardTitle>
          <Button variant="secondary" size="sm" onClick={() => setShowPaymentModal(true)}>
            <Plus className="w-4 h-4" /> Tambah
          </Button>
        </div>
        {paymentMethods.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Belum ada metode pembayaran</p>
        ) : (
          <div className="space-y-2">
            {paymentMethods.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    {m.type === "bank" ? "🏦" : m.type === "ewallet" ? "📱" : "📲"} {m.name}
                  </p>
                  <p className="text-xs text-slate-500">{m.account_name} • {m.account_number}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeletePayment(m.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Export/Import */}
      <Card>
        <CardTitle>💾 Backup & Restore</CardTitle>
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Download semua data (dompet, transaksi, invoice, dll) atau restore dari backup sebelumnya.</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => {
              const json = exportDb();
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `mughis-bank-backup-${new Date().toISOString().split("T")[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Data berhasil diexport!");
            }}>
              <Download className="w-4 h-4" /> Export Data
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".json";
              input.onchange = async (e: any) => {
                const file = e.target?.files?.[0];
                if (!file) return;
                const text = await file.text();
                const err = importDb(text);
                if (err) return toast.error(err);
                toast.success("Data berhasil diimport! Halaman akan di-refresh.");
                setTimeout(() => window.location.reload(), 1500);
              };
              input.click();
            }}>
              <Upload className="w-4 h-4" /> Import Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <CardTitle>🎨 Tampilan</CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon className="w-5 h-5 text-slate-500" /> : <Sun className="w-5 h-5 text-slate-500" />}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {theme === "dark" ? "Mode Gelap" : theme === "light" ? "Mode Terang" : "Mengikuti Sistem"}
            </span>
          </div>
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-700 p-1">
            {(["light", "dark", "system"] as const).map((t) => (
              <button key={t} onClick={() => setTheme(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === t ? "bg-white dark:bg-slate-600 shadow-sm" : "text-slate-500"}`}>
                {t === "light" ? "Terang" : t === "dark" ? "Gelap" : "Sistem"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Logout */}
      <Card>
        <Button variant="danger" className="w-full" onClick={signOut}>
          <LogOut className="w-4 h-4" /> Keluar
        </Button>
      </Card>

      <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Tambah Metode Pembayaran" size="sm">
        <div className="space-y-4">
          <Select label="Tipe" value={paymentForm.type} onChange={(e) => setPaymentForm((f) => ({ ...f, type: e.target.value }))}
            options={[{ value: "bank", label: "🏦 Rekening Bank" }, { value: "ewallet", label: "📱 E-Wallet" }, { value: "qris", label: "📲 QRIS" }]} />
          <Input label="Nama" placeholder={paymentForm.type === "bank" ? "Nama Bank (BCA, Mandiri...)" : "Nama E-Wallet (DANA, OVO...)"}
            value={paymentForm.name} onChange={(e) => setPaymentForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Atas Nama" placeholder="Nama pemilik rekening" value={paymentForm.account_name}
            onChange={(e) => setPaymentForm((f) => ({ ...f, account_name: e.target.value }))} />
          <Input label="Nomor Rekening" placeholder="Nomor rekening/ID" value={paymentForm.account_number}
            onChange={(e) => setPaymentForm((f) => ({ ...f, account_number: e.target.value }))} />
          <Button className="w-full" onClick={handleAddPayment}>Tambah</Button>
        </div>
      </Modal>
    </div>
  );
}
