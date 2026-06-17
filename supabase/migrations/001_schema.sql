-- MUGHIS BANK - Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Business Profiles
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name TEXT DEFAULT '',
  business_category TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  tax_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Methods (Bank/E-Wallet accounts for invoices)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'ewallet', 'qris')),
  name TEXT NOT NULL,
  account_name TEXT DEFAULT '',
  account_number TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets (Cash, Bank, E-Wallet)
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'ewallet')),
  icon TEXT DEFAULT '💳',
  balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories (Transaction categories)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products/Services
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Umum',
  type TEXT NOT NULL CHECK (type IN ('product', 'service')),
  price DECIMAL(15,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  title TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('print', 'laptop', 'umum')) DEFAULT 'umum',
  status TEXT NOT NULL CHECK (status IN ('Belum Lunas', 'DP', 'Lunas')) DEFAULT 'Belum Lunas',
  subtotal DECIMAL(15,2) DEFAULT 0,
  discount DECIMAL(15,2) DEFAULT 0,
  tax DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0,
  dp DECIMAL(15,2) DEFAULT 0,
  remaining DECIMAL(15,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  quantity INTEGER DEFAULT 1,
  price DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0
);

-- Print Specifications (for print invoice type)
CREATE TABLE IF NOT EXISTS spec_print (
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE PRIMARY KEY,
  book_size TEXT DEFAULT '',
  binding TEXT DEFAULT '',
  final_size TEXT DEFAULT '',
  paper_type TEXT DEFAULT '',
  cover_type TEXT DEFAULT '',
  laminating TEXT DEFAULT '',
  wrapping TEXT DEFAULT ''
);

-- Laptop Specifications (for laptop invoice type)
CREATE TABLE IF NOT EXISTS spec_laptop (
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE PRIMARY KEY,
  laptop_name TEXT DEFAULT '',
  processor TEXT DEFAULT '',
  ram TEXT DEFAULT '',
  storage TEXT DEFAULT '',
  screen TEXT DEFAULT '',
  condition TEXT DEFAULT '',
  warranty TEXT DEFAULT ''
);

-- Umum Specifications (for umum invoice type)
CREATE TABLE IF NOT EXISTS spec_umum (
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE PRIMARY KEY,
  trans_type TEXT DEFAULT '',
  description TEXT DEFAULT ''
);

-- Debts (Hutang)
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  amount DECIMAL(15,2) NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'Belum Lunas' CHECK (status IN ('Belum Lunas', 'Lunas')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receivables (Piutang)
CREATE TABLE IF NOT EXISTS receivables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  amount DECIMAL(15,2) NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'Belum Lunas' CHECK (status IN ('Belum Lunas', 'Lunas')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  period TEXT DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  old_data JSONB DEFAULT '{}',
  new_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  currency TEXT DEFAULT 'IDR',
  language TEXT DEFAULT 'id',
  ai_enabled BOOLEAN DEFAULT true,
  ai_api_key TEXT DEFAULT '',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Insights (cached AI analysis)
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('spending', 'saving', 'prediction', 'anomaly')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_print ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_laptop ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_umum ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
DROP POLICY IF EXISTS "Users can manage own business profile" ON business_profiles;
CREATE POLICY "Users can manage own business profile"
  ON business_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own payment methods" ON payment_methods;
CREATE POLICY "Users can manage own payment methods"
  ON payment_methods FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own wallets" ON wallets;
CREATE POLICY "Users can manage own wallets"
  ON wallets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own categories" ON categories;
CREATE POLICY "Users can manage own categories"
  ON categories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;
CREATE POLICY "Users can manage own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own customers" ON customers;
CREATE POLICY "Users can manage own customers"
  ON customers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own products" ON products;
CREATE POLICY "Users can manage own products"
  ON products FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own invoices" ON invoices;
CREATE POLICY "Users can manage own invoices"
  ON invoices FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own invoice items" ON invoice_items;
CREATE POLICY "Users can manage own invoice items"
  ON invoice_items FOR ALL
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own spec_print" ON spec_print;
CREATE POLICY "Users can manage own spec_print"
  ON spec_print FOR ALL
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = spec_print.invoice_id AND invoices.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own spec_laptop" ON spec_laptop;
CREATE POLICY "Users can manage own spec_laptop"
  ON spec_laptop FOR ALL
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = spec_laptop.invoice_id AND invoices.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own spec_umum" ON spec_umum;
CREATE POLICY "Users can manage own spec_umum"
  ON spec_umum FOR ALL
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = spec_umum.invoice_id AND invoices.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own debts" ON debts;
CREATE POLICY "Users can manage own debts"
  ON debts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own receivables" ON receivables;
CREATE POLICY "Users can manage own receivables"
  ON receivables FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own budgets" ON budgets;
CREATE POLICY "Users can manage own budgets"
  ON budgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own AI insights" ON ai_insights;
CREATE POLICY "Users can view own AI insights"
  ON ai_insights FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-create default categories and wallet on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default wallet
  INSERT INTO public.wallets (user_id, name, type, icon, balance)
  VALUES (NEW.id, 'Tunai', 'cash', '💵', 0);

  -- Create default expense categories
  INSERT INTO public.categories (user_id, name, type, icon, color)
  VALUES
    (NEW.id, 'Makanan', 'expense', '🍽️', '#ef4444'),
    (NEW.id, 'Transportasi', 'expense', '🚗', '#f97316'),
    (NEW.id, 'Belanja', 'expense', '🛒', '#eab308'),
    (NEW.id, 'Tagihan', 'expense', '📋', '#06b6d4'),
    (NEW.id, 'Kesehatan', 'expense', '🏥', '#22c55e'),
    (NEW.id, 'Hiburan', 'expense', '🎮', '#a855f7'),
    (NEW.id, 'Lainnya', 'expense', '📦', '#6b7280');

  -- Create default income categories
  INSERT INTO public.categories (user_id, name, type, icon, color)
  VALUES
    (NEW.id, 'Gaji', 'income', '💰', '#22c55e'),
    (NEW.id, 'Bisnis', 'income', '💼', '#3b82f6'),
    (NEW.id, 'Investasi', 'income', '📈', '#8b5cf6'),
    (NEW.id, 'Lainnya', 'income', '📥', '#6b7280');

  -- Create default user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  -- Create default business profile
  INSERT INTO public.business_profiles (user_id, business_name)
  VALUES (NEW.id, '');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_receivables_user_id ON receivables(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
