import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supportedCurrencies, currencyFlags, formatCurrency } from "@/utils/formatCurrency";

const rates: Record<string, number> = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095, AED: 0.044, SGD: 0.016, JPY: 1.79, AUD: 0.018, CAD: 0.016, THB: 0.42 };

export default function CurrencyConverter() {
  const [amount, setAmount] = useState(1000);
  const [from, setFrom] = useState("INR");
  const [to, setTo] = useState("USD");
  const [result, setResult] = useState<number | null>(null);

  const convert = () => { const r = (amount / (1 / rates[from])) * rates[to]; setResult(Math.round(r * 100) / 100); };
  const swap = () => { setFrom(to); setTo(from); setResult(null); };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-center font-heading text-3xl font-extrabold text-foreground">Currency Converter</h1>
        <p className="mt-2 text-center text-muted-foreground">Quick travel currency conversions</p>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div><label className="mb-1.5 block text-sm font-medium text-foreground">Amount</label><Input type="number" value={amount} onChange={(e) => { setAmount(Number(e.target.value)); setResult(null); }} className="text-2xl font-bold" /></div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1"><label className="mb-1.5 block text-sm font-medium text-foreground">From</label><select value={from} onChange={(e) => { setFrom(e.target.value); setResult(null); }} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground">{supportedCurrencies.map((c) => <option key={c} value={c}>{currencyFlags[c]} {c}</option>)}</select></div>
            <button onClick={swap} className="mt-5 rounded-full border border-border p-2 transition-colors hover:bg-accent"><ArrowLeftRight className="h-5 w-5 text-foreground" /></button>
            <div className="flex-1"><label className="mb-1.5 block text-sm font-medium text-foreground">To</label><select value={to} onChange={(e) => { setTo(e.target.value); setResult(null); }} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground">{supportedCurrencies.map((c) => <option key={c} value={c}>{currencyFlags[c]} {c}</option>)}</select></div>
          </div>
          <Button onClick={convert} className="mt-6 w-full rounded-xl py-5 text-base font-semibold">Convert</Button>
          {result !== null && (
            <div className="mt-6 rounded-xl bg-background p-4 text-center">
              <p className="text-sm text-muted-foreground">{amount} {from} =</p>
              <p className="font-heading text-3xl font-extrabold text-primary">{result.toLocaleString()} {to}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
