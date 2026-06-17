"use client";

import { usePathname } from "next/navigation";
import { Menu, Search, Bell } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { useThemeStore } from "@/lib/store/theme-store";
import { cn } from "@/lib/utils/cn";

interface NavbarProps {
  onMenuClick: () => void;
  onCmdPalette: () => void;
}

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/finance": "Keuangan",
  "/wallets": "Dompet",
  "/invoices": "Invoice",
  "/customers": "Pelanggan",
  "/products": "Produk & Jasa",
  "/debts": "Hutang",
  "/receivables": "Piutang",
  "/reports": "Laporan",
  "/settings": "Pengaturan",
};

export function Navbar({ onMenuClick, onCmdPalette }: NavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useThemeStore();
  const loading = useAppStore((s) => s.loading);
  const title = pageTitles[pathname] || "MUGHIS BANK";

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold font-heading text-slate-900 dark:text-white">{title}</h1>
            {loading && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[10px] text-slate-400">Memperbarui data...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCmdPalette}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            Cari sesuatu...
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono text-slate-500">
              Ctrl+K
            </kbd>
          </button>

          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" onClick={onCmdPalette}>
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
