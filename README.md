# MUGHIS BANK v3.0

Sistem Manajemen Keuangan, Invoice, & Bisnis UMKM Modern.

![MUGHIS BANK](public/icons/icon-192.png)

## ✨ Fitur Lengkap

### 📊 Dashboard
- Ringkasan keuangan real-time (pemasukan, pengeluaran, laba bersih)
- Grafik interaktif 7 hari (Recharts)
- Ringkasan invoice, hutang, piutang
- AI Financial Insights untuk analisis naratif
- Menu cepat akses modul utama

### 💰 Keuangan
- Catat pemasukan & pengeluaran dengan kategori
- Multi-dompet (Kas, Bank, E-Wallet)
- Transfer antar dompet
- AI kategorisasi otomatis dari deskripsi
- Filter, search, dan sorting transaksi

### 📄 Invoice
- 3 template: Percetakan Buku, Laptop Bekas, Umum
- Spesifikasi detail per jenis
- Manajemen status (Belum Lunas, DP, Lunas)
- Export gambar (PNG) via html2canvas
- Export PDF via jsPDF
- Bagikan via WhatsApp otomatis
- Cetak langsung

### 👥 Pelanggan (CRM)
- Manajemen kontak pelanggan
- Riwayat invoice per pelanggan

### 📦 Produk & Jasa
- Manajemen produk dan jasa
- Tracking stok
- Kategori produk

### 💳 Hutang & Piutang
- Catat hutang dan piutang
- Tracking status dan jatuh tempo

### 📈 Laporan
- Laba/Rugi per periode (Harian, Mingguan, Bulanan, Tahunan)
- Grafik tren keuangan
- Distribusi kategori (Pie Chart)
- Export CSV

### ⚙️ Pengaturan
- Profil bisnis (nama, alamat, kontak)
- Metode pembayaran (Bank, E-Wallet, QRIS)
- Mode gelap/terang/sistem
- AI API Key (Gemini)

### 🚀 Fitur Next-Level
- **Command Palette** (Ctrl+K) — pencarian cepat menu
- **Dark Mode** — dukungan tema gelap/terang/sistem
- **PWA** — installable di mobile/desktop, offline caching
- **Responsive** — mobile-first, adaptif semua perangkat
- **Real-time** — data sinkron otomatis via Supabase
- **Optimistic UI** — interaksi terasa instan
- **Audit Trail** — log aktivitas pengguna

## 🛠️ Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| **Next.js 14** (App Router) | Frontend framework, SSR/SSG |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **Supabase** | Database (PostgreSQL), Auth, Storage |
| **Zustand** | State management |
| **Recharts** | Grafik interaktif |
| **Lucide React** | Ikon modern |
| **html2canvas** | Export invoice ke gambar |
| **jsPDF** | Export invoice ke PDF |
| **react-hot-toast** | Notifikasi |
| **Cloudflare Pages** | Hosting & deployment |

## 📋 Prasyarat

- Node.js 18+ dan npm
- Akun [Supabase](https://supabase.com) (Free tier)
- Akun [GitHub](https://github.com)
- Akun [Cloudflare](https://cloudflare.com) (Free tier)

## 🚀 Setup Lokal

### 1. Clone repositori

```bash
git clone https://github.com/username/mughis-bank.git
cd mughis-bank
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [Supabase Dashboard](https://supabase.com/dashboard)
2. Buka **SQL Editor** dan jalankan semua kode dari:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_functions.sql`
3. Di **Project Settings > API**, copy URL dan Anon Key

### 4. Konfigurasi Auth Supabase

1. Buka **Authentication > Settings**
2. Aktifkan **Email Auth** (default aktif)
3. *(Opsional)* Aktifkan Google OAuth:
   - Buat kredensial OAuth di [Google Cloud Console](https://console.cloud.google.com)
   - Redirect URL: `https://[project].supabase.co/auth/v1/callback`
   - Masukkan Client ID dan Client Secret di Supabase Auth Settings

### 5. Environment variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment ke Cloudflare Pages

### Via GitHub + Cloudflare Dashboard (Mudah)

1. Push kode ke GitHub repository
2. Buka [Cloudflare Dashboard](https://dash.cloudflare.com) > **Pages**
3. Klik **Create a Project** > **Connect to Git**
4. Pilih repositori GitHub
5. Konfigurasi build:
   - **Build command:** `npm run pages:build`
   - **Build output directory:** `.vercel/output/static`
   - **Root directory:** (biarkan default)
6. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (set ke domain Pages Anda)
7. Klik **Save and Deploy**

### Via Wrangler CLI

```bash
# Login ke Cloudflare
npx wrangler login

# Build dan deploy
npm run pages:deploy
```

## 🔧 Konfigurasi Tambahan

### Fitur AI (Opsional)

Untuk mengaktifkan AI kategorisasi yang lebih cerdas:

1. Dapatkan API Key gratis dari [Google AI Studio](https://aistudio.google.com/apikey)
2. Tambahkan ke `.env.local`:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
   ```
3. Atau masukkan melalui halaman **Settings > AI Assistant** di aplikasi

### PWA (Progressive Web App)

Aplikasi sudah siap PWA:
- `public/manifest.json` — konfigurasi manifest
- `public/sw.js` — service worker untuk offline caching
- Ikon sudah tersedia di `public/icons/`

## 📁 Struktur Proyek

```
mughis-bank/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Halaman login, register, forgot-password
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/      # Halaman dashboard dan modul
│   │   │   ├── page.tsx      # Dashboard
│   │   │   ├── finance/
│   │   │   ├── wallets/
│   │   │   ├── invoices/
│   │   │   ├── customers/
│   │   │   ├── products/
│   │   │   ├── debts/
│   │   │   ├── receivables/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── auth/             # Auth callback routes
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/               # UI components (Button, Card, Modal, etc.)
│   │   ├── layout/           # Sidebar, Navbar, BottomNav, CommandPalette
│   │   ├── dashboard/        # DashboardChart, RecentActivity
│   │   └── invoice/          # InvoiceDetail
│   ├── lib/
│   │   ├── store/            # Zustand stores (auth, theme, app)
│   │   ├── supabase/         # Supabase client/server/middleware
│   │   └── utils/            # format, cn, ai helpers
│   └── types/                # TypeScript types & Database types
├── supabase/
│   └── migrations/           # SQL schema & functions
├── public/
│   ├── icons/                # App icons
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service Worker
├── .env.local.example
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── README.md
```

## 📊 Database Schema (Supabase)

### Tabel Utama:
- `business_profiles` — Profil bisnis pengguna
- `payment_methods` — Rekening bank/E-Wallet untuk invoice
- `wallets` — Dompet pengguna (cash, bank, ewallet)
- `categories` — Kategori transaksi
- `transactions` — Catatan transaksi keuangan
- `customers` — Data pelanggan
- `products` — Produk & jasa
- `invoices` — Invoice/faktur
- `invoice_items` — Item dalam invoice
- `spec_print` — Spesifikasi percetakan
- `spec_laptop` — Spesifikasi laptop
- `spec_umum` — Spesifikasi umum
- `debts` — Hutang
- `receivables` — Piutang
- `budgets` — Anggaran
- `audit_logs` — Log aktivitas
- `user_preferences` — Preferensi pengguna
- `ai_insights` — Cache analisis AI

### Keamanan:
- Row Level Security (RLS) diaktifkan di semua tabel
- Setiap pengguna hanya bisa mengakses data miliknya sendiri
- Trigger otomatis membuat data default saat registrasi

## 🤝 Kontribusi

Silakan buat issue atau pull request untuk kontribusi.

## 📝 Lisensi

MIT License — lihat file LICENSE untuk detail.

---

Dibuat dengan ❤️ oleh Mughis Group
#   m u g h i s - b a n k  
 