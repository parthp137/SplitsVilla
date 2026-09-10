import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trophy,
  Award,
  Sparkles,
  Share2,
  Check,
  DollarSign,
  Calendar,
  Users,
  Heart,
  TrendingDown,
  MapPin,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateRange } from "@/utils/formatDate";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

interface TripWrappedProps {
  isOpen: boolean;
  onClose: () => void;
  trip: {
    id: string;
    title: string;
    destination: string;
    checkIn: string;
    checkOut: string;
    members: (string | Member)[];
    totalExpenses?: number;
    budgetPerPerson?: number;
  } | null;
}

export default function TripWrappedModal({ isOpen, onClose, trip }: TripWrappedProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"highlights" | "accolades" | "breakdown">("highlights");

  if (!trip) return null;

  const memberCount = trip.members.length || 4;
  const totalSpent = trip.totalExpenses || 87200;
  const perPerson = Math.round(totalSpent / Math.max(memberCount, 1));
  const budget = (trip.budgetPerPerson || 25000) * memberCount;
  const savings = Math.max(0, budget - totalSpent);

  // Mock categories breakdown
  const categories = [
    { label: "Luxury Villa Stay", amount: Math.round(totalSpent * 0.52), percent: 52, color: "bg-primary" },
    { label: "Gourmet Dining & Drinks", amount: Math.round(totalSpent * 0.26), percent: 26, color: "bg-amber-500" },
    { label: "Group Activities & Tours", amount: Math.round(totalSpent * 0.14), percent: 14, color: "bg-emerald-500" },
    { label: "Transit & Rentals", amount: Math.round(totalSpent * 0.08), percent: 8, color: "bg-blue-500" },
  ];

  // Accolades
  const accolades = [
    {
      role: "👑 The Banker",
      winner: typeof trip.members[0] === "object" ? trip.members[0].name : "Alex Rivera",
      description: `Covered 68% of group upfront bills and settled in under 4 minutes!`,
      icon: <DollarSign className="h-5 w-5 text-amber-400" />,
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
      role: "🧭 The Early Bird",
      winner: typeof trip.members[1] === "object" ? trip.members[1].name : "Sarah Chen",
      description: `First to confirm every itinerary vote and proposed 4 hidden-gem stops.`,
      icon: <Award className="h-5 w-5 text-emerald-400" />,
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    {
      role: "🏖️ The Chill Master",
      winner: typeof trip.members[2] === "object" ? trip.members[2].name : "Marcus Vance",
      description: `Logged 12 hours of poolside relaxation and picked the ultimate sunset spot.`,
      icon: <Heart className="h-5 w-5 text-pink-400" />,
      badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    },
    {
      role: "🌟 Top Stay Consensus",
      winner: "Sunset Cliff Villa",
      description: `100% group unanimous vote achieved in record 42 seconds!`,
      icon: <Trophy className="h-5 w-5 text-primary" />,
      badgeColor: "bg-primary/10 text-primary border-primary/20",
    },
  ];

  const handleShare = () => {
    const summaryText = `✨ SplitsVilla Trip Wrapped: ${trip.title} ✨\n📍 Destination: ${trip.destination}\n📅 ${formatDateRange(trip.checkIn, trip.checkOut)}\n💰 Total Shared: ${formatCurrency(totalSpent)} (${formatCurrency(perPerson)}/person)\n🎉 Group Accolades:\n• 👑 Banker: ${accolades[0].winner}\n• 🧭 Early Bird: ${accolades[1].winner}\n• 🏖️ Chill Master: ${accolades[2].winner}\n\nPlanned & Split seamlessly with SplitsVilla!`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    toast({
      title: "Trip Wrapped Copied!",
      description: "Summary formatted and ready to paste into your squad group chat.",
    });
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-border/80 bg-card/95 p-0 overflow-hidden shadow-2xl backdrop-blur-xl max-h-[90vh] flex flex-col">
        {/* Header Hero Banner */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary p-6 text-primary-foreground overflow-hidden">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-black/10 blur-xl" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" /> Trip Wrapped 2026
              </div>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl tracking-tight">{trip.title}</h2>
              <div className="mt-1 flex items-center gap-3 text-sm text-primary-foreground/80 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {trip.destination}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {formatDateRange(trip.checkIn, trip.checkOut)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full bg-black/20 p-2 text-primary-foreground/80 hover:bg-black/40 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="relative z-10 mt-6 flex gap-2 border-t border-white/20 pt-4">
            {(
              [
                { id: "highlights", label: "✨ Highlights" },
                { id: "accolades", label: "🏆 Squad Accolades" },
                { id: "breakdown", label: "📊 Spending Split" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-primary shadow-sm"
                    : "bg-white/15 text-primary-foreground hover:bg-white/25"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "highlights" && (
              <motion.div
                key="highlights"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-border/80 bg-muted/40 p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Total Spent</p>
                    <p className="mt-1 text-2xl font-black text-foreground">{formatCurrency(totalSpent)}</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <TrendingDown className="h-3 w-3" /> Saved {formatCurrency(savings)}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-muted/40 p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Per Traveler</p>
                    <p className="mt-1 text-2xl font-black text-primary">{formatCurrency(perPerson)}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Fair {memberCount}-way split</p>
                  </div>

                  <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border/80 bg-muted/40 p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Squad Size</p>
                    <p className="mt-1 text-2xl font-black text-foreground">{memberCount} Explorers</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">100% debts settled</p>
                  </div>
                </div>

                {/* Fun Trip Milestone Card */}
                <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent p-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Perfect Harmony Rating: 9.8/10</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your group settled all payments in under 4 minutes with zero disputed expenses!
                    </p>
                  </div>
                </div>

                {/* Top Moments Snapshot */}
                <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Adventure Highlights
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 rounded-xl bg-muted/30 p-2.5">
                      <span className="text-lg">🏡</span>
                      <div>
                        <p className="font-semibold text-foreground text-xs">Top Stay</p>
                        <p className="text-[11px] text-muted-foreground">Sunset Cliff Villa (5★)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-muted/30 p-2.5">
                      <span className="text-lg">🍽️</span>
                      <div>
                        <p className="font-semibold text-foreground text-xs">Best Group Dinner</p>
                        <p className="text-[11px] text-muted-foreground">Oceanfront Seafood Feast</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-muted/30 p-2.5">
                      <span className="text-lg">🏄</span>
                      <div>
                        <p className="font-semibold text-foreground text-xs">Peak Activity</p>
                        <p className="text-[11px] text-muted-foreground">Sunset Yacht & Snorkel</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-muted/30 p-2.5">
                      <span className="text-lg">⚡</span>
                      <div>
                        <p className="font-semibold text-foreground text-xs">Fastest Split</p>
                        <p className="text-[11px] text-muted-foreground">42s Instant Settlement</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "accolades" && (
              <motion.div
                key="accolades"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {accolades.map((acc, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`font-bold text-xs ${acc.badgeColor}`}>
                        {acc.role}
                      </Badge>
                      <div className="p-1.5 rounded-full bg-muted/50">{acc.icon}</div>
                    </div>
                    <p className="mt-3 text-base font-bold text-foreground">{acc.winner}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{acc.description}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === "breakdown" && (
              <motion.div
                key="breakdown"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Visual Progress Bar */}
                <div className="space-y-2">
                  <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
                    {categories.map((cat, i) => (
                      <div
                        key={i}
                        className={`${cat.color} transition-all`}
                        style={{ width: `${cat.percent}%` }}
                        title={`${cat.label}: ${cat.percent}%`}
                      />
                    ))}
                  </div>
                </div>

                {/* Category Breakdown list */}
                <div className="space-y-2.5">
                  {categories.map((cat, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${cat.color}`} />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                          <p className="text-xs text-muted-foreground">{cat.percent}% of total budget</p>
                        </div>
                      </div>
                      <span className="font-bold text-foreground">{formatCurrency(cat.amount)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border bg-muted/30 p-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground hidden sm:block">
            Share these memories & brag about your squad!
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1 sm:flex-none">
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleShare}
              className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow-md"
            >
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Copied Summary!" : "Share Memory Book"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
