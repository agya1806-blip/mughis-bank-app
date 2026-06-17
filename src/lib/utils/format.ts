export function formatCurrency(amount: number, currency = "Rp"): string {
  return `${currency} ${Math.abs(amount).toLocaleString("id-ID")}`;
}

export function formatDate(date: string | Date, format: "short" | "long" | "full" = "short"): string {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta",
  };

  switch (format) {
    case "short":
      options.dateStyle = "short";
      break;
    case "long":
      options.dateStyle = "long";
      break;
    case "full":
      options.dateStyle = "full";
      break;
  }

  return d.toLocaleDateString("id-ID", options);
}

export function formatDateISO(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
  return `${Math.floor(diffDays / 365)} tahun lalu`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV/${y}${m}${d}/${rand}`;
}

export function formatPhone(phone: string): string {
  return phone.startsWith("0") ? `62${phone.slice(1)}` : phone;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
