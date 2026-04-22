import { Link, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, Plus, Heart, Plane, BarChart3, Bell, AlertCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";
import { mockNotifications } from "@/utils/mockData";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateRange, timeAgo } from "@/utils/formatDate";
import { useDeleteTrip, useTrips } from "@/hooks/useApi";
import { DashboardSkeleton } from "@/components/SkeletonLoaders";
import {
  PageTransitionWrapper,
  AmbientBackgroundMotion,
  BlurReveal,
  AnimatedCounter,
} from "@/components/effects/AdvancedAnimations";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: trips = [], isLoading, error } = useTrips();
  const deleteTrip = useDeleteTrip();

  const activeTrips = trips.filter((t) => t.status === "active" || t.status === "planning");
  const totalGroupMembers = activeTrips.reduce((acc, trip) => acc + trip.members.length, 0);
  const totalGroupSpend = activeTrips.reduce((acc, trip) => acc + trip.totalExpenses, 0);
  const overBudgetTrips = activeTrips.filter(
    (trip) => trip.totalExpenses > trip.budgetPerPerson * Math.max(1, trip.members.length),
  ).length;

  const stats = [
    { label: "Active Trips", value: activeTrips.length, icon: Plane },
    { label: "Group Members", value: totalGroupMembers, icon: Users },
    { label: "Trips Over Budget", value: overBudgetTrips, icon: AlertCircle },
    { label: "Total Group Spend", value: formatCurrency(totalGroupSpend), icon: BarChart3 },
  ];

  const getTripOrganizerId = (trip: any) => {
    const createdBy = trip?.createdBy;
    if (!createdBy) return "";
    if (typeof createdBy === "string") return createdBy;
    return createdBy.id || createdBy._id || "";
  };

  const handleDeleteTrip = async (trip: any) => {
    const organizerId = getTripOrganizerId(trip);
    if (organizerId && organizerId !== user?.id) {
      toast({ title: "Organizer only action", description: "Only the organizer can delete this trip.", variant: "destructive" });
      return;
    }

    const confirmed = window.confirm(`Delete \"${trip.title}\"? This removes the trip, invites, expenses, and related notifications.`);
    if (!confirmed) return;

    try {
      await deleteTrip.mutateAsync(trip.id);
      toast({ title: "Trip deleted", description: `\"${trip.title}\" has been removed.` });
    } catch (error) {
      toast({ title: "Could not delete trip", description: "Please try again.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransitionWrapper>
      <div className="relative min-h-screen overflow-hidden bg-background">
        <div className="fixed inset-0 -z-10">
          <AmbientBackgroundMotion />
          <motion.div
            className="absolute inset-0 opacity-15"
            animate={{ background: ["radial-gradient(ellipse at 0% 0%, rgba(249, 115, 22, 0.12) 0%, transparent 50%)", "radial-gradient(ellipse at 100% 100%, rgba(250, 204, 21, 0.12) 0%, transparent 50%) ", "radial-gradient(ellipse at 0% 0%, rgba(249, 115, 22, 0.12) 0%, transparent 50%)"] }}
            transition={{ duration: 15, repeat: Infinity }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8">
          {/* Error Alert */}
          {error && (
            <motion.div 
              className="mb-6 flex gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Error loading trips</p>
                <p className="text-sm text-destructive/80">Failed to fetch your trips. Please try refreshing the page.</p>
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <BlurReveal>
                <h1 className="font-heading text-3xl font-extrabold text-foreground">Welcome back, {user?.name?.split(" ")[0] || "Traveler"} 👋</h1>
              </BlurReveal>
              <motion.p className="mt-1 text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                Here's what's happening with your trips
              </motion.p>
            </div>
            <motion.button onClick={() => navigate("/dashboard/trips/create")} className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Plus className="mr-2 inline h-4 w-4" /> Plan New Trip
            </motion.button>
          </motion.div>

          <motion.div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
            {stats.map((s, i) => (
              <motion.div key={s.label} variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }} whileHover={{ scale: 1.05 }} className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/5 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                    <s.icon className="h-5 w-5 text-primary" />
                  </motion.div>
                </div>
                <motion.p className="mt-2 font-heading text-2xl font-extrabold text-foreground">
                  {typeof s.value === "number" ? <AnimatedCounter from={0} to={s.value} duration={2} /> : s.value}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold">Active Trips</h2>
                <Link to="/dashboard/trips" className="text-sm font-semibold text-primary">
                  View all
                </Link>
              </div>
              <motion.div className="mt-4 space-y-3" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="visible">
                {error ? (
                  <motion.div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                    <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
                    <p className="mt-2 text-sm font-medium text-foreground">Could not load trips</p>
                    <p className="text-xs text-muted-foreground">Please try again later</p>
                  </motion.div>
                ) : activeTrips.length === 0 ? (
                  <motion.div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-6 text-center text-sm text-muted-foreground">No trips yet</motion.div>
                ) : (
                  activeTrips.map((trip) => (
                    <motion.div key={trip.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} whileHover={{ scale: 1.02 }}>
                      <Link to={`/trips/${trip.id}`} className="relative block rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/5 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-500">{trip.status}</span>
                              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{trip.members.length}/{trip.groupSize} members</span>
                            </div>
                            <h3 className="mt-3 font-heading text-base font-bold">{trip.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{trip.destination}</p>
                          </div>
                          {getTripOrganizerId(trip) === user?.id && (
                            <button
                              type="button"
                              className="shrink-0 rounded-full border border-destructive/20 bg-background/90 p-2 text-destructive shadow-sm transition hover:bg-destructive/10"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                void handleDeleteTrip(trip);
                              }}
                              aria-label={`Delete ${trip.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold">Split Insights</h2>
                <Link to="/notifications" className="text-sm font-semibold text-primary">
                  View all
                </Link>
              </div>
              <motion.div className="mt-4 space-y-3" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="visible">
                <motion.div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/5 p-4" variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                  <p className="text-sm font-medium text-foreground">You are coordinating {activeTrips.length} active group trip(s).</p>
                  <p className="text-xs text-muted-foreground">Keep spend transparent and settle early to avoid end-trip stress.</p>
                </motion.div>
                <motion.div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/5 p-4" variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                  <p className="text-sm font-medium text-foreground">{overBudgetTrips} trip(s) are currently over budget.</p>
                  <p className="text-xs text-muted-foreground">Review high-spend categories and propose a shared adjustment plan.</p>
                </motion.div>
                <motion.div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/5 p-4" variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                  <p className="text-sm font-medium text-foreground">Average spend per active trip: {formatCurrency(activeTrips.length ? Math.round(totalGroupSpend / activeTrips.length) : 0)}</p>
                  <p className="text-xs text-muted-foreground">Track this metric weekly to keep group decisions realistic.</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransitionWrapper>
  );
}
