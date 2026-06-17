"use client";

import { create } from "zustand";
import type { Wallet, Category, Customer, Product, Transaction, Invoice, Debt, Receivable, BusinessProfile, PaymentMethod } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface AppState {
  wallets: Wallet[];
  categories: Category[];
  customers: Customer[];
  products: Product[];
  transactions: Transaction[];
  invoices: Invoice[];
  debts: Debt[];
  receivables: Receivable[];
  businessProfile: BusinessProfile | null;
  paymentMethods: PaymentMethod[];
  loading: boolean;

  setWallets: (wallets: Wallet[]) => void;
  setCategories: (categories: Category[]) => void;
  setCustomers: (customers: Customer[]) => void;
  setProducts: (products: Product[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  setDebts: (debts: Debt[]) => void;
  setReceivables: (receivables: Receivable[]) => void;
  setBusinessProfile: (profile: BusinessProfile | null) => void;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  setLoading: (loading: boolean) => void;

  fetchAll: () => Promise<void>;
  fetchWallets: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchDebts: () => Promise<void>;
  fetchReceivables: () => Promise<void>;
  fetchBusinessProfile: () => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  wallets: [],
  categories: [],
  customers: [],
  products: [],
  transactions: [],
  invoices: [],
  debts: [],
  receivables: [],
  businessProfile: null,
  paymentMethods: [],
  loading: false,

  setWallets: (wallets) => set({ wallets }),
  setCategories: (categories) => set({ categories }),
  setCustomers: (customers) => set({ customers }),
  setProducts: (products) => set({ products }),
  setTransactions: (transactions) => set({ transactions }),
  setInvoices: (invoices) => set({ invoices }),
  setDebts: (debts) => set({ debts }),
  setReceivables: (receivables) => set({ receivables }),
  setBusinessProfile: (profile) => set({ businessProfile: profile }),
  setPaymentMethods: (methods) => set({ paymentMethods: methods }),
  setLoading: (loading) => set({ loading }),

  fetchAll: async () => {
    set({ loading: true });
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const fetches = await Promise.all([
      supabase.from("wallets").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("categories").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("customers").select("*").eq("user_id", user.id).order("name"),
      supabase.from("products").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("transactions").select("*, wallets(*), categories(*)").eq("user_id", user.id).order("date", { ascending: false }).limit(100),
      supabase.from("invoices").select("*, customers(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("debts").select("*, wallets(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("receivables").select("*, wallets(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("business_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("payment_methods").select("*").eq("user_id", user.id).eq("is_active", true),
    ]);

    set({
      wallets: fetches[0].data || [],
      categories: fetches[1].data || [],
      customers: fetches[2].data || [],
      products: fetches[3].data || [],
      transactions: fetches[4].data || [],
      invoices: fetches[5].data || [],
      debts: fetches[6].data || [],
      receivables: fetches[7].data || [],
      businessProfile: fetches[8].data || null,
      paymentMethods: fetches[9].data || [],
      loading: false,
    });
  },

  fetchWallets: async () => {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await supabase.from("wallets").select("*").eq("user_id", user.id).eq("is_active", true);
    if (data) set({ wallets: data });
  },

  fetchCategories: async () => {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await supabase.from("categories").select("*").eq("user_id", user.id).eq("is_active", true);
    if (data) set({ categories: data });
  },

  fetchCustomers: async () => {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await supabase.from("customers").select("*").eq("user_id", user.id).order("name");
    if (data) set({ customers: data });
  },

  fetchProducts: async () => {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await supabase.from("products").select("*").eq("user_id", user.id).eq("is_active", true);
    if (data) set({ products: data });
  },

  fetchTransactions: async () => {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await supabase.from("transactions").select("*, wallets(*), categories(*)").eq("user_id", user.id).order("date", { ascending: false }).limit(100);
    if (data) set({ transactions: data });
  },

  fetchInvoices: async () => {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await supabase.from("invoices").select("*, customers(*)").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) set({ invoices: data });
  },

  fetchDebts: async () => {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await supabase.from("debts").select("*, wallets(*)").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) set({ debts: data });
  },

  fetchReceivables: async () => {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await supabase.from("receivables").select("*, wallets(*)").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) set({ receivables: data });
  },

  fetchBusinessProfile: async () => {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await supabase.from("business_profiles").select("*").eq("user_id", user.id).single();
    if (data) set({ businessProfile: data });
  },

  fetchPaymentMethods: async () => {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await supabase.from("payment_methods").select("*").eq("user_id", user.id).eq("is_active", true);
    if (data) set({ paymentMethods: data });
  },
}));
