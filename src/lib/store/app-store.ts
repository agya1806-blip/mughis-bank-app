"use client";

import { create } from "zustand";
import type { Wallet, Category, Customer, Product, Transaction, Invoice, Debt, Receivable, BusinessProfile, PaymentMethod } from "@/types";
import { createClient } from "@/lib/localDb";

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

const client = createClient();

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
    const user = (await client.auth.getUser()).data.user;
    if (!user) return;

    const fetches = await Promise.all([
      client.from("wallets").select("*").eq("user_id", user.id).eq("is_active", true),
      client.from("categories").select("*").eq("user_id", user.id).eq("is_active", true),
      client.from("customers").select("*").eq("user_id", user.id).order("name"),
      client.from("products").select("*").eq("user_id", user.id).eq("is_active", true),
      client.from("transactions").select("*, wallets(*), categories(*)").eq("user_id", user.id).order("date", { ascending: false }).limit(100),
      client.from("invoices").select("*, customers(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
      client.from("debts").select("*, wallets(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
      client.from("receivables").select("*, wallets(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
      client.from("business_profiles").select("*").eq("user_id", user.id).single(),
      client.from("payment_methods").select("*").eq("user_id", user.id).eq("is_active", true),
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
    const user = (await client.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await client.from("wallets").select("*").eq("user_id", user.id).eq("is_active", true);
    if (data) set({ wallets: data as Wallet[] });
  },

  fetchCategories: async () => {
    const user = (await client.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await client.from("categories").select("*").eq("user_id", user.id).eq("is_active", true);
    if (data) set({ categories: data as Category[] });
  },

  fetchCustomers: async () => {
    const user = (await client.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await client.from("customers").select("*").eq("user_id", user.id).order("name");
    if (data) set({ customers: data as Customer[] });
  },

  fetchProducts: async () => {
    const user = (await client.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await client.from("products").select("*").eq("user_id", user.id).eq("is_active", true);
    if (data) set({ products: data as Product[] });
  },

  fetchTransactions: async () => {
    const user = (await client.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await client.from("transactions").select("*, wallets(*), categories(*)").eq("user_id", user.id).order("date", { ascending: false }).limit(100);
    if (data) set({ transactions: data as Transaction[] });
  },

  fetchInvoices: async () => {
    const user = (await client.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await client.from("invoices").select("*, customers(*)").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) set({ invoices: data as Invoice[] });
  },

  fetchDebts: async () => {
    const user = (await client.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await client.from("debts").select("*, wallets(*)").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) set({ debts: data as Debt[] });
  },

  fetchReceivables: async () => {
    const user = (await client.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await client.from("receivables").select("*, wallets(*)").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) set({ receivables: data as Receivable[] });
  },

  fetchBusinessProfile: async () => {
    const user = (await client.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await client.from("business_profiles").select("*").eq("user_id", user.id).single();
    if (data) set({ businessProfile: data as BusinessProfile });
  },

  fetchPaymentMethods: async () => {
    const user = (await client.auth.getUser()).data.user;
    if (!user) return;
    const { data } = await client.from("payment_methods").select("*").eq("user_id", user.id).eq("is_active", true);
    if (data) set({ paymentMethods: data as PaymentMethod[] });
  },
}));
