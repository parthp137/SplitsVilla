import { Link, useNavigate } from "react-router-dom";
import { Plus, MapPin, Calendar, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { mockTrips } from "@/utils/mockData";
import { formatDateRange } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";

const statusColors: Record<string, string> = {
  planning: "bg-info/10 text-info",
  active: "bg-success/10 text-success",
  completed: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
};

export default function MyTrips() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-extrabold text-foreground">My Trips</h1>
          <Button onClick={() => navigate("/dashboard/trips/create")} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" /> Plan New Trip
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockTrips.map((trip) => (
            <Link to={`/trips/${trip.id}`} key={trip.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover">
              <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20">
                {trip.finalizedProperty?.images[0] && (
                  <img src={trip.finalizedProperty.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
                )}
                <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[trip.status]}`}>
                  {trip.status}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-bold text-foreground">{trip.title}</h3>
                <div className="mt-2 space-y-1.5">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{trip.destination}, {trip.country}</p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{formatDateRange(trip.checkIn, trip.checkOut)}</p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-3.5 w-3.5" />{trip.members.length}/{trip.groupSize} members</p>
                </div>
                {/* Budget progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Budget: {formatCurrency(trip.budgetPerPerson)}/person</span>
                    <span className="font-semibold text-foreground">{formatCurrency(trip.totalExpenses)} spent</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, (trip.totalExpenses / (trip.budgetPerPerson * trip.members.length)) * 100)}%` }}
                    />
                  </div>
                </div>
                {/* Member avatars */}
                <div className="mt-4 flex -space-x-2">
                  {trip.members.slice(0, 5).map((m) => (
                    <div key={m.userId} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-semibold text-foreground">
                      {m.name[0]}
                    </div>
                  ))}
                  {trip.members.length > 5 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-xs text-muted-foreground">
                      +{trip.members.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
