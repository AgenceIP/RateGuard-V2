export function money(amount: number, currency: string, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency, maximumFractionDigits }).format(amount);
}

export function dateLabel(iso: string): string {
  // Rates and verification stamps are UTC dates; render them as such so a
  // timestamp doesn't slide to the previous day in a western timezone.
  return new Date(iso.length === 10 ? iso + "T00:00:00Z" : iso).toLocaleDateString("en-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function daysUntilLabel(iso: string | null): string {
  if (!iso) return "date not set";
  const days = Math.round((new Date(iso + "T00:00:00Z").getTime() - Date.now()) / 86400000);
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
