export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_category: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  logo_url: string;
  tax_id: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'bank' | 'ewallet' | 'qris';
  name: string;
  account_name: string;
  account_number: string;
  is_active: boolean;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: 'cash' | 'bank' | 'ewallet';
  icon: string;
  balance: number;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  attachment_url?: string;
  created_at: string;
  wallets?: Wallet;
  categories?: Category;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: string;
  type: 'product' | 'service';
  price: number;
  stock: number;
  unit: string;
  is_active: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  customer_id: string;
  invoice_number: string;
  title: string;
  type: 'print' | 'laptop' | 'umum';
  status: 'Belum Lunas' | 'DP' | 'Lunas';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  dp: number;
  remaining: number;
  notes: string;
  issue_date: string;
  due_date: string;
  created_at: string;
  customers?: Customer;
  invoice_items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SpecPrint {
  invoice_id: string;
  book_size: string;
  binding: string;
  final_size: string;
  paper_type: string;
  cover_type: string;
  laminating: string;
  wrapping: string;
}

export interface SpecLaptop {
  invoice_id: string;
  laptop_name: string;
  processor: string;
  ram: string;
  storage: string;
  screen: string;
  condition: string;
  warranty: string;
}

export interface SpecUmum {
  invoice_id: string;
  trans_type: string;
  description: string;
}

export interface Debt {
  id: string;
  user_id: string;
  wallet_id: string;
  name: string;
  phone: string;
  amount: number;
  description: string;
  date: string;
  due_date: string;
  status: 'Belum Lunas' | 'Lunas';
  created_at: string;
  wallets?: Wallet;
}

export interface Receivable {
  id: string;
  user_id: string;
  wallet_id: string;
  name: string;
  phone: string;
  amount: number;
  description: string;
  date: string;
  due_date: string;
  status: 'Belum Lunas' | 'Lunas';
  created_at: string;
  wallets?: Wallet;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  created_at: string;
  categories?: Category;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  currency: string;
  language: string;
  ai_enabled: boolean;
  ai_api_key: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  type: 'spending' | 'saving' | 'prediction' | 'anomaly';
  title: string;
  description: string;
  data: any;
  created_at: string;
}
