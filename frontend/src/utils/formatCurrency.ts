import { useEffect, useState } from "react";

const currencyMap: Record<string, { locale: string; symbol: string; rateFromINR: number }> = {
  INR: { locale: "en-IN", symbol: "₹", rateFromINR: 1 },
  USD: { locale: "en-US", symbol: "$", rateFromINR: 0.0116 },
  EUR: { locale: "de-DE", symbol: "€", rateFromINR: 0.0108 },
  GBP: { locale: "en-GB", symbol: "£", rateFromINR: 0.0091 },
  AED: { locale: "ar-AE", symbol: "د.إ", rateFromINR: 0.0425 },
  SGD: { locale: "en-SG", symbol: "S$", rateFromINR: 0.0157 },
  JPY: { locale: "ja-JP", symbol: "¥", rateFromINR: 1.76 },
  AUD: { locale: "en-AU", symbol: "A$", rateFromINR: 0.0182 },
  CAD: { locale: "en-CA", symbol: "C$", rateFromINR: 0.0163 },
  THB: { locale: "th-TH", symbol: "฿", rateFromINR: 0.4 },
};

export const supportedCurrencies = Object.keys(currencyMap);

export const currencyFlags: Record<string, string> = {
  INR: "🇮🇳",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  AED: "🇦🇪",
  SGD: "🇸🇬",
  JPY: "🇯🇵",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
  THB: "🇹🇭",
};

export const currencyNames: Record<string, string> = {
  INR: "Indian Rupee",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  AED: "UAE Dirham",
  SGD: "Singapore Dollar",
  JPY: "Japanese Yen",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  THB: "Thai Baht",
};

export function getActiveCurrency(): string {
  if (typeof window === "undefined") return "INR";
  return localStorage.getItem("sv_currency") || "INR";
}

export function setActiveCurrency(currency: string): void {
  if (typeof window === "undefined") return;
  if (!currencyMap[currency]) return;
  localStorage.setItem("sv_currency", currency);
  window.dispatchEvent(new CustomEvent("sv_currency_change", { detail: { currency } }));
}

/**
 * React hook to listen to global currency changes
 */
export function useCurrency() {
  const [currency, setCurrencyState] = useState<string>(getActiveCurrency());

  useEffect(() => {
    const handleCurrencyChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ currency: string }>;
      if (customEvent.detail?.currency) {
        setCurrencyState(customEvent.detail.currency);
      } else {
        setCurrencyState(getActiveCurrency());
      }
    };

    window.addEventListener("sv_currency_change", handleCurrencyChange);
    window.addEventListener("storage", handleCurrencyChange);
    return () => {
      window.removeEventListener("sv_currency_change", handleCurrencyChange);
      window.removeEventListener("storage", handleCurrencyChange);
    };
  }, []);

  const changeCurrency = (code: string) => {
    setActiveCurrency(code);
    setCurrencyState(code);
  };

  return {
    currency,
    setCurrency: changeCurrency,
    symbol: currencyMap[currency]?.symbol || "₹",
    flag: currencyFlags[currency] || "🇮🇳",
  };
}

export function convertAmount(amountInINR: number, targetCurrency: string): number {
  const rate = currencyMap[targetCurrency]?.rateFromINR ?? 1;
  return amountInINR * rate;
}

export function formatCurrency(amount: number, currency?: string): string {
  const activeCurr = currency || getActiveCurrency();
  const config = currencyMap[activeCurr] || currencyMap.INR;
  const convertedAmount = currency ? amount : amount * config.rateFromINR;

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: activeCurr,
    minimumFractionDigits: activeCurr === "JPY" ? 0 : 0,
    maximumFractionDigits: activeCurr === "JPY" ? 0 : 0,
  }).format(convertedAmount);
}

export function formatCurrencyCompact(amount: number, currency?: string): string {
  const activeCurr = currency || getActiveCurrency();
  const config = currencyMap[activeCurr] || currencyMap.INR;
  const converted = currency ? amount : amount * config.rateFromINR;

  if (activeCurr === "INR") {
    if (converted >= 100000) return `${config.symbol}${(converted / 100000).toFixed(1)}L`;
    if (converted >= 1000) return `${config.symbol}${(converted / 1000).toFixed(1)}K`;
  } else {
    if (converted >= 1000000) return `${config.symbol}${(converted / 1000000).toFixed(1)}M`;
    if (converted >= 1000) return `${config.symbol}${(converted / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount, currency);
}
