import { Link, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, Plus, Heart, Plane, BarChart3, Bell, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";
import { mockNotifications } from "@/utils/mockData";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateRange, timeAgo } from "@/utils/formatDate";
import { useTrips } from "@/hooks/useApi";
import { DashboardSkeleton } from "@/components/SkeletonLoaders";
import {
  PageTransitionWrapper,
  AmbientBackgroundMotion,
  BlurReveal,
  AnimatedCounter,
} from "@/components/effects/AdvancedAnimations";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: trips = [], isLoading, error } = useTrips();

  const activeTrips = trips.filter((t) => t.status === "active" || t.status === "planning");
  const stats = [
    { label: "Active Trips", value: activeTrips.length, icon: Plane },
    { label: "Upcoming Bookings", value: 2, icon: Calendar },
    { label: "Saved Properties", value: user?.wishlist?.length || 0, icon: Heart },
    { label: "Total Spent", value: formatCurrency(87200), icon: BarChart3 },
  ];

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
                      <Link to={`/trips/${trip.id}`} className="block rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/5 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-heading text-base font-bold">{trip.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{trip.destination}</p>
                          </div>
                          <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-500">{trip.status}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold">Recent Activity</h2>
                <Link to="/notifications" className="text-sm font-semibold text-primary">
                  View all
                </Link>
              </div>
              <motion.div className="mt-4 space-y-3" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="visible">
                {mockNotifications.slice(0, 4).map((notif) => (
                  <motion.div key={notif.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/5 p-4">
                    <p className="text-sm font-medium text-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(notif.createdAt)}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransitionWrapper>
  );
}
