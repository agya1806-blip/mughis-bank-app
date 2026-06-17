"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard, TrendingUp, Wallet, FileText, Users, Package, CreditCard, HandCoins, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const commands = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, keywords: "beranda home" },
  { href: "/finance", label: "Keuangan", icon: TrendingUp, keywords: "transaksi pemasukan pengeluaran" },
  { href: "/wallets", label: "Dompet", icon: Wallet, keywords: "saldo dompet transfer" },
  { href: "/invoices", label: "Invoice", icon: FileText, keywords: "faktur tagihan nota" },
  { href: "/customers", label: "Pelanggan", icon: Users, keywords: "customer klien kontak" },
  { href: "/products", label: "Produk & Jasa", icon: Package, keywords: "barang stok harga" },
  { href: "/debts", label: "Hutang", icon: CreditCard, keywords: "utang pinjaman" },
  { href: "/receivables", label: "Piutang", icon: HandCoins, keywords: "tagihan piutang" },
  { href: "/reports", label: "Laporan", icon: BarChart3, keywords: "report laba rugi arus kas" },
  { href: "/settings", label: "Pengaturan", icon: Settings, keywords: "setting profil bisnis" },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.keywords.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      router.push(filtered[selectedIndex].href);
      onClose();
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari menu, pelanggan, invoice..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-mono text-slate-400">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">Tidak ditemukan</div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.href}
                onClick={() => {
                  router.push(cmd.href);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-colors text-left",
                  i === selectedIndex
                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                )}
              >
                <cmd.icon className="w-4 h-4" />
                {cmd.label}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
