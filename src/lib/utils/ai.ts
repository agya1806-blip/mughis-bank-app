const categoryKeywords: Record<string, string[]> = {
  Makanan: ["makan", "nasi", "ayam", "bakso", "soto", "mie", "kopi", "minum", "cafe", "restoran", "warung", "gorengan", "sate", "seblak"],
  Transportasi: ["bensin", "bbm", "solar", "pertalite", "pertamax", "parkir", "toll", "tol", "grab", "gojek", "ojek", "taksi", "bus", "kereta"],
  Belanja: ["belanja", "sembako", "supermarket", "alfamart", "indomaret", "minyak", "gula", "telur", "sabun", "shampoo"],
  Tagihan: ["listrik", "pln", "air", "pdam", "bpjs", "pulsa", "kuota", "internet", "telkom", "indihome", "tv kabel"],
  Kesehatan: ["obat", "dokter", "klinik", "rumah sakit", "rs", "apotek", "vitamin", "sehat"],
  Pendidikan: ["sekolah", "kuliah", "bimbel", "kursus", "buku", "les", "spp", "uang gedung"],
  Hiburan: ["nonton", "netflix", "spotify", "game", "steam", "film", "bioskop", "liburan"],
  Gaji: ["gaji", "honor", "upah", "fee", "komisi", "thr", "bonus"],
  Bisnis: ["jual", "dagang", "order", "customer", "pelanggan", "invoice", "proyek", "kontrak"],
  Investasi: ["saham", "reksadana", "crypto", "emas", "deposito", "invest"],
  Lainnya: [],
};

const incomeKeywords = ["gaji", "honor", "jual", "dagang", "order", "customer", "fee", "komisi", "bonus", "thr", "investasi", "dividen"];

export function suggestCategory(description: string): { name: string; type: "income" | "expense" } {
  const desc = description.toLowerCase();

  const isIncome = incomeKeywords.some((k) => desc.includes(k));
  if (isIncome) {
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((k) => desc.includes(k))) {
        return { name: cat, type: "income" };
      }
    }
    return { name: "Bisnis", type: "income" };
  }

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((k) => desc.includes(k))) {
      return { name: cat, type: "expense" };
    }
  }

  return { name: "Lainnya", type: "expense" };
}

export function generateAISummary(data: {
  income: number;
  expense: number;
  incomeChange: number;
  expenseChange: number;
}): string {
  const { income, expense, incomeChange, expenseChange } = data;
  const net = income - expense;
  const parts: string[] = [];

  if (expenseChange > 20) {
    parts.push(
      `Pengeluaran Anda naik ${expenseChange.toFixed(0)}% bulan ini. Pertimbangkan untuk mengevaluasi kembali pengeluaran tidak penting.`
    );
  }
  if (incomeChange > 20) {
    parts.push(
      `Pemasukan Anda naik ${incomeChange.toFixed(0)}% — performa yang bagus!`
    );
  }
  if (incomeChange < -10) {
    parts.push(
      `Pemasukan turun ${Math.abs(incomeChange).toFixed(0)}%. Coba tingkatkan promosi atau jangkau lebih banyak pelanggan.`
    );
  }
  if (net < 0) {
    parts.push(
      `Saat ini pengeluaran melebihi pemasukan. Disarankan untuk membuat anggaran yang lebih ketat.`
    );
  } else if (net > 0 && net < income * 0.1) {
    parts.push(
      `Margin laba Anda tipis (${((net / income) * 100).toFixed(0)}%). Pertimbangkan untuk menaikkan harga atau mengurangi biaya.`
    );
  } else if (net > income * 0.3) {
    parts.push(
      `Margin laba yang sehat di ${((net / income) * 100).toFixed(0)}%. Pertahankan strategi bisnis Anda!`
    );
  }

  if (parts.length === 0) {
    parts.push("Keuangan Anda stabil. Terus pantau dan catat setiap transaksi secara rutin.");
  }

  return parts.join(" ");
}

export function generateWhatsAppMessage(invoice: {
  invoice_number: string;
  customer_name: string;
  total: number;
  status: string;
  items?: { name: string; quantity: number; price: number }[];
}): string {
  let msg = `*MUGHIS BANK - INVOICE*\n\n`;
  msg += `*No. Invoice:* ${invoice.invoice_number}\n`;
  msg += `*Kepada:* ${invoice.customer_name}\n\n`;
  msg += `*Status:* ${invoice.status}\n`;
  msg += `*Total:* Rp ${invoice.total.toLocaleString("id-ID")}\n\n`;

  if (invoice.items && invoice.items.length > 0) {
    msg += `*Detail Item:*\n`;
    invoice.items.forEach((item) => {
      msg += `- ${item.name} x${item.quantity} @ Rp ${item.price.toLocaleString("id-ID")}\n`;
    });
    msg += "\n";
  }

  msg += `Terima kasih atas kepercayaan Anda.\n`;
  msg += `MUGHIS BANK - Solusi Keuangan UMKM`;
  return encodeURIComponent(msg);
}
