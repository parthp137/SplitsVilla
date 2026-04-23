const currencyMap: Record<string, { locale: string; symbol: string }> = {
  INR: { locale: "en-IN", symbol: "₹" },
  USD: { locale: "en-US", symbol: "$" },
  EUR: { locale: "de-DE", symbol: "€" },
  GBP: { locale: "en-GB", symbol: "£" },
  AED: { locale: "ar-AE", symbol: "د.إ" },
  SGD: { locale: "en-SG", symbol: "S$" },
  JPY: { locale: "ja-JP", symbol: "¥" },
  AUD: { locale: "en-AU", symbol: "A$" },
  CAD: { locale: "en-CA", symbol: "C$" },
  THB: { locale: "th-TH", symbol: "฿" },
};

export function formatCurrency(amount: number, currency = "INR"): string {
  const config = currencyMap[currency] || currencyMap.INR;
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number, currency = "INR"): string {
  if (amount >= 100000) return `${currencyMap[currency]?.symbol || "₹"}${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${currencyMap[currency]?.symbol || "₹"}${(amount / 1000).toFixed(1)}K`;
  return formatCurrency(amount, currency);
}

export const supportedCurrencies = Object.keys(currencyMap);
export const currencyFlags: Record<string, string> = {
  INR: "🇮🇳", USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", AED: "🇦🇪",
  SGD: "🇸🇬", JPY: "🇯🇵", AUD: "🇦🇺", CAD: "🇨🇦", THB: "🇹🇭",
};
