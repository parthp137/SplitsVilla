
import { useState } from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateRange } from "@/utils/formatDate";
import { MapPin, Users, Calendar, AlertCircle, Sparkles, Trophy } from "lucide-react";
import { useTrips } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import TripWrappedModal from "@/components/trip/TripWrappedModal";

export default function TripHistory() {
  const { data: trips = [], isLoading, error } = useTrips();
  const completed = trips.filter((t) => t.status === "completed");
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);

  const handleOpenWrapped = (trip: any) => {
    setSelectedTrip(trip);
    setIsWrappedOpen(true);
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-foreground">Past Adventures</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Relive your completed journeys, group splits, and squad accolades.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">Failed to load trip history. Please try again later.</p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          {[{ l: "Trips Completed", v: completed.length }, { l: "Destinations Explored", v: Math.max(completed.length, 1) }, { l: "Total Split", v: formatCurrency(87200) }].map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="font-heading text-2xl font-black text-foreground">{s.v}</p>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {completed.map((t) => (
            <div key={t.id} className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/40 hover:shadow-card-hover">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-lg font-bold text-foreground">{t.title}</h3>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Completed
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" />{t.destination}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-primary" />{formatDateRange(t.checkIn, t.checkOut)}</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-primary" />{t.members.length} members</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleOpenWrapped(t)}
                  className="gap-1.5 self-start bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow-sm hover:opacity-95"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Trip Wrapped
                </Button>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                  Total: <span className="font-bold text-foreground">{formatCurrency(t.totalExpenses || 87200)}</span> · Per person: <span className="font-bold text-primary">{formatCurrency(Math.round((t.totalExpenses || 87200) / Math.max(t.members.length, 1)))}</span>
                </p>
                <button
                  onClick={() => handleOpenWrapped(t)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Trophy className="h-3 w-3" /> View Accolades
                </button>
              </div>
            </div>
          ))}
          {completed.length === 0 && !error && (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <h4 className="mt-2 font-bold text-foreground">No completed trips yet</h4>
              <p className="text-sm text-muted-foreground mt-1">Plan your first getaway with friends and unlock your custom Trip Wrapped!</p>
            </div>
          )}
        </div>

        {/* Trip Wrapped Modal */}
        <TripWrappedModal
          isOpen={isWrappedOpen}
          onClose={() => setIsWrappedOpen(false)}
          trip={selectedTrip}
        />
      </div>
    </div>
  );
}

