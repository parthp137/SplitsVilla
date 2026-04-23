import { Link, useNavigate } from "react-router-dom";
import { Plus, MapPin, Calendar, Users, AlertCircle, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useDeleteTrip, useTrips } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateRange } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusColors: Record<string, string> = {
  planning: "bg-info/10 text-info",
  active: "bg-success/10 text-success",
  completed: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
};

export default function MyTrips() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: trips = [], isLoading, error } = useTrips();
  const deleteTrip = useDeleteTrip();
  const [tripToDelete, setTripToDelete] = useState<any | null>(null);

  const getTripOrganizerId = (trip: any) => {
    const createdBy = trip?.createdBy;
    if (!createdBy) return "";
    if (typeof createdBy === "string") return createdBy;
    return createdBy.id || createdBy._id || "";
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;

    try {
      await deleteTrip.mutateAsync(tripToDelete.id);
      toast({ title: "Trip deleted", description: `\"${tripToDelete.title}\" has been removed.` });
      setTripToDelete(null);
    } catch (error) {
      toast({ title: "Could not delete trip", description: "Please try again.", variant: "destructive" });
    }
  };

  const requestDeleteTrip = (trip: any) => {
    const organizerId = getTripOrganizerId(trip);
    if (organizerId && organizerId !== user?.id) {
      toast({ title: "Organizer only action", description: "Only the organizer can delete this trip.", variant: "destructive" });
      return;
    }

    setTripToDelete(trip);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <Skeleton className="h-10 w-52" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          {error && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
              <p className="flex items-center gap-2 font-medium text-destructive">
                <AlertCircle className="h-4 w-4" /> Could not load trips
              </p>
              <p className="mt-1 text-sm text-destructive/80">Please refresh and try again.</p>
            </div>
          )}

          {!error && trips.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center">
              <p className="font-heading text-xl font-bold text-foreground">No trips yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Create your first group trip and start splitting expenses fairly.</p>
              <Button onClick={() => navigate("/dashboard/trips/create")} className="mt-4 rounded-full">
                <Plus className="mr-2 h-4 w-4" /> Plan New Trip
              </Button>
            </div>
          )}

          {trips.map((trip) => {
            const membersCount = Math.max(1, trip.members.length);
            const totalBudget = trip.budgetPerPerson * membersCount;
            const spentRatio = totalBudget > 0 ? (trip.totalExpenses / totalBudget) * 100 : 0;
            const perPersonSpent = trip.totalExpenses / membersCount;
            const overBudget = trip.totalExpenses > totalBudget;
            const canDelete = getTripOrganizerId(trip) === user?.id;

            return (
            <Link to={`/trips/${trip.id}`} key={trip.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover">
              <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20">
                {trip.finalizedProperty?.images[0] && (
                  <img src={trip.finalizedProperty.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
                )}
                <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-2 pr-10">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[trip.status]}`}>
                      {trip.status}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${overBudget ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>
                      {overBudget ? "Over budget" : "On track"}
                    </span>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      className="shrink-0 rounded-full border border-destructive/20 bg-background/90 p-2 text-destructive shadow-sm transition hover:bg-destructive/10"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        requestDeleteTrip(trip);
                      }}
                      aria-label={`Delete ${trip.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
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
                      className={`h-full rounded-full transition-all ${overBudget ? "bg-destructive" : "bg-primary"}`}
                      style={{ width: `${Math.min(100, spentRatio)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Per-person spend: {formatCurrency(Math.round(perPersonSpent))}</span>
                    <span className={overBudget ? "font-semibold text-destructive" : "font-semibold text-success"}>
                      {overBudget ? `${formatCurrency(Math.round(trip.totalExpenses - totalBudget))} over` : `${formatCurrency(Math.round(totalBudget - trip.totalExpenses))} left`}
                    </span>
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
            );
          })}
        </div>
      </div>

      <AlertDialog open={!!tripToDelete} onOpenChange={(open) => !open && setTripToDelete(null)}>
        <AlertDialogContent className="max-w-[92vw] rounded-lg sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete trip?</AlertDialogTitle>
            <AlertDialogDescription>
              {`Delete \"${tripToDelete?.title || "this trip"}\"? This removes the trip, invites, expenses, and related notifications.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
              onClick={handleDeleteTrip}
              disabled={deleteTrip.isPending}
            >
              {deleteTrip.isPending ? "Deleting..." : "Delete Trip"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
