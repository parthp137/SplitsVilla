import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Compass,
  MapPin,
  Sparkles,
  Sun,
  Users,
  CheckCircle2,
  Circle,
  ArrowRight,
  Plane,
  CreditCard,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trip } from "@/types";
import { formatDateRange } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";

interface TripCountdownHubProps {
  trips: Trip[];
}

export function TripCountdownHub({ trips }: TripCountdownHubProps) {
  // Find nearest upcoming trip
  const upcomingTrip = trips
    .filter((t) => t.status === "planning" || t.status === "active")
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())[0];

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!upcomingTrip?.checkIn) return;

    const updateCountdown = () => {
      const target = new Date(upcomingTrip.checkIn).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [upcomingTrip?.checkIn]);

  if (!upcomingTrip) {
    return (
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card/70 to-card p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Start Planning</Badge>
          <h3 className="font-heading font-extrabold text-xl text-foreground">No upcoming trips planned yet</h3>
          <p className="text-xs text-muted-foreground">Create your next group adventure and start voting on stays with friends!</p>
        </div>
        <Button asChild className="gap-2 bg-gradient-to-r from-primary to-violet-600 shadow-md">
          <Link to="/dashboard/trips/create">
            <Compass className="h-4 w-4" /> Create a Trip
          </Link>
        </Button>
      </div>
    );
  }

  // Calculate Readiness Milestones
  const hasStayShortlisted = (upcomingTrip.savedProperties?.length || 0) > 0;
  const isGroupFull = upcomingTrip.members.length >= (upcomingTrip.groupSize || 2);
  const hasExpenses = (upcomingTrip.totalExpenses || 0) > 0;
  const milestones = [
    { label: "Stays Shortlisted & Voted", done: hasStayShortlisted },
    { label: "Traveller Invites Sent", done: upcomingTrip.members.length > 1 },
    { label: "Group Capacity Filled", done: isGroupFull },
    { label: "Shared Budget Initialized", done: hasExpenses },
  ];
  const completedMilestones = milestones.filter((m) => m.done).length;
  const readinessPercent = Math.round((completedMilestones / milestones.length) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/90 to-background p-6 md:p-8 shadow-card space-y-6 backdrop-blur-md">
      {/* Background ambient decorative shapes */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-gradient-to-r from-primary to-violet-600 text-white text-[11px] font-bold px-2.5 py-0.5">
              🚀 Next Adventure
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {upcomingTrip.destination}, {upcomingTrip.country}
            </span>
          </div>

          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            {upcomingTrip.title}
          </h2>

          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" /> {formatDateRange(upcomingTrip.checkIn, upcomingTrip.checkOut)} ({upcomingTrip.nights} nights)
          </p>
        </div>

        {/* Live Countdown Timer Clock Box */}
        <div className="flex items-center gap-2 rounded-2xl bg-card/90 border border-border/80 p-3 shadow-inner">
          <div className="text-center px-2">
            <span className="font-heading font-black text-2xl md:text-3xl text-primary block leading-none">
              {timeLeft.days}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Days</span>
          </div>
          <span className="text-xl font-bold text-muted-foreground/50 pb-3">:</span>
          <div className="text-center px-2">
            <span className="font-heading font-black text-2xl md:text-3xl text-foreground block leading-none">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Hours</span>
          </div>
          <span className="text-xl font-bold text-muted-foreground/50 pb-3">:</span>
          <div className="text-center px-2">
            <span className="font-heading font-black text-2xl md:text-3xl text-foreground block leading-none">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Mins</span>
          </div>
        </div>
      </div>

      {/* Grid of Readiness & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 border-t border-border/50">
        {/* Readiness Checklist */}
        <div className="lg:col-span-2 rounded-2xl bg-card/60 border border-border/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Trip Readiness Score
            </span>
            <span className="font-bold text-primary">{readinessPercent}% Complete</span>
          </div>

          <Progress value={readinessPercent} className="h-2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {m.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                )}
                <span className={m.done ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div className="rounded-2xl bg-card/60 border border-border/60 p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Users className="h-3.5 w-3.5 text-primary" /> {upcomingTrip.members.length}/{upcomingTrip.groupSize} Travellers
            </span>
            <span className="text-emerald-500 font-semibold">
              {formatCurrency(upcomingTrip.budgetPerPerson)}/pers
            </span>
          </div>

          <Button asChild className="w-full gap-2 shadow-sm font-semibold text-xs">
            <Link to={`/trips/${upcomingTrip.id}`}>
              Open Trip Board <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TripCountdownHub;
