"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/lib/store/auth-store";
import { useThemeStore } from "@/lib/store/theme-store";
import {
  LayoutDashboard,
  Wallet,
  FileText,
  TrendingUp,
  Users,
  Package,
  CreditCard,
  HandCoins,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  X,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/finance", label: "Keuangan", icon: TrendingUp },
  { href: "/wallets", label: "Dompet", icon: Wallet },
  { href: "/invoices", label: "Invoice", icon: FileText },
  { href: "/customers", label: "Pelanggan", icon: Users },
  { href: "/products", label: "Produk", icon: Package },
  { href: "/debts", label: "Hutang", icon: CreditCard },
  { href: "/receivables", label: "Piutang", icon: HandCoins },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useThemeStore();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                <span className="text-lg font-bold text-white font-heading">MB</span>
              </div>
              <div>
                <h2 className="font-bold font-heading text-slate-900 dark:text-white text-lg leading-tight">
                  MUGHIS <span className="text-teal-500">BANK</span>
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Manajemen Keuangan UMKM</p>
              </div>
            </Link>
            <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "sidebar-link",
                  isActive && "active"
                )}
                onClick={onClose}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-sm font-bold text-teal-600 dark:text-teal-400">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
