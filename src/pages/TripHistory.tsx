
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateRange } from "@/utils/formatDate";
import { MapPin, Users, Calendar, AlertCircle } from "lucide-react";
import { useTrips } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";

export default function TripHistory() {
  const { data: trips = [], isLoading, error } = useTrips();
  const completed = trips.filter((t) => t.status === "completed");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-6 h-20 w-full" />
          <div className="mt-8 space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">Past Adventures</h1>

        {error && (
          <div className="mt-4 flex gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">Failed to load trip history. Please try again later.</p>
          </div>
        )}

        <div className="mt-4 flex gap-6 text-center">
          {[{ l: "Trips", v: completed.length }, { l: "Destinations", v: 1 }, { l: "Total Spent", v: formatCurrency(87200) }].map((s) => (
            <div key={s.l} className="rounded-xl border border-border bg-card px-5 py-3">
              <p className="font-heading text-xl font-bold text-foreground">{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 space-y-4">
          {completed.map((t) => (
            <div key={t.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-heading text-lg font-bold text-foreground">{t.title}</h3>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{t.destination}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDateRange(t.checkIn, t.checkOut)}</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{t.members.length} members</span>
              </div>
              <p className="mt-3 text-sm text-foreground">Total: <span className="font-bold">{formatCurrency(t.totalExpenses)}</span> · Per person: <span className="font-bold text-primary">{formatCurrency(Math.round(t.totalExpenses / t.members.length))}</span></p>
            </div>
          ))}
          {completed.length === 0 && !error && <p className="py-16 text-center text-muted-foreground">No adventures yet — plan your first trip!</p>}
        </div>
      </div>
    </div>
  );
}
