import React, { useState } from "react";
import {
  Activity,
  ThumbsUp,
  CreditCard,
  UserPlus,
  Home,
  Calendar,
  Sparkles,
  X,
  ChevronRight,
  Bell,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Trip, TripMember, Expense } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";

interface ActivityItem {
  id: string;
  type: "vote" | "expense" | "stay" | "member" | "itinerary";
  user: string;
  avatar?: string;
  action: string;
  details?: string;
  timestamp: string;
}

interface TripActivityFeedProps {
  trip: Trip;
  expenses: Expense[];
}

export function TripActivityFeed({ trip, expenses }: TripActivityFeedProps) {
  const [filter, setFilter] = useState<"all" | "stays" | "expenses">("all");

  // Derive simulated and real live activity stream from trip data
  const activities: ActivityItem[] = [
    ...(trip?.savedProperties?.map((p, idx) => ({
      id: `stay-${idx}`,
      type: "stay" as const,
      user: "Group Member",
      action: "shortlisted a new stay candidate",
      details: `Property ID: ${p.propertyId.slice(-6)}`,
      timestamp: "Today",
    })) || []),
    ...expenses.map((e, idx) => ({
      id: `expense-${e.id || idx}`,
      type: "expense" as const,
      user: e.paidByName || "Traveller",
      action: `added expense: "${e.description}"`,
      details: `${formatCurrency(e.amount)} split among ${e.splitAmong?.length || trip.members.length} members`,
      timestamp: "Recent",
    })),
    ...trip.members.map((m, idx) => ({
      id: `member-${m.userId || idx}`,
      type: "member" as const,
      user: m.name,
      avatar: m.avatar,
      action: m.role === "organizer" ? "created the trip" : "joined the trip group",
      timestamp: "Trip kickoff",
    })),
  ];

  const filteredActivities = activities.filter((act) => {
    if (filter === "stays") return act.type === "stay" || act.type === "vote";
    if (filter === "expenses") return act.type === "expense";
    return true;
  });

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "vote":
        return <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />;
      case "expense":
        return <CreditCard className="h-3.5 w-3.5 text-amber-500" />;
      case "stay":
        return <Home className="h-3.5 w-3.5 text-primary" />;
      case "member":
        return <UserPlus className="h-3.5 w-3.5 text-blue-500" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-purple-500" />;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border/80 bg-card/60 backdrop-blur-sm shadow-sm hover:border-primary/50"
        >
          <Activity className="h-4 w-4 text-primary animate-pulse" />
          <span className="hidden sm:inline">Live Activity</span>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold">
            {activities.length}
          </Badge>
        </Button>
      </SheetTrigger>

      <SheetContent className="sm:max-w-md p-0 flex flex-col border-border/80 bg-background/95 backdrop-blur-xl">
        <SheetHeader className="p-5 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="h-4 w-4" />
            </span>
            <div>
              <SheetTitle className="text-base font-bold font-heading">
                Group Activity Stream
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                Real-time feed of member actions, votes, and expenses
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 pt-3">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setFilter("all")}
            >
              All ({activities.length})
            </Button>
            <Button
              variant={filter === "stays" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setFilter("stays")}
            >
              Stays & Votes
            </Button>
            <Button
              variant={filter === "expenses" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setFilter("expenses")}
            >
              Expenses
            </Button>
          </div>
        </SheetHeader>

        {/* Stream List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 divide-y divide-border/30">
          {filteredActivities.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No recent activities in this category.
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div key={act.id} className="pt-3 first:pt-0 flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5 border border-border/60">
                  {getIcon(act.type)}
                </div>

                <div className="space-y-0.5 flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-relaxed">
                    <strong className="font-semibold text-foreground">{act.user}</strong>{" "}
                    <span className="text-muted-foreground">{act.action}</span>
                  </p>

                  {act.details && (
                    <p className="text-[11px] font-medium text-primary truncate">
                      {act.details}
                    </p>
                  )}

                  <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1 pt-0.5">
                    <Clock className="h-2.5 w-2.5" /> {act.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default TripActivityFeed;
