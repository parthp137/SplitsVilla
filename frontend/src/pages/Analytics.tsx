import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Home,
  DollarSign,
  Calendar,
  Star,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Check,
  ShieldCheck,
  Eye,
  Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApiAdvanced } from "@/hooks/useApiAdvanced";
import { formatCurrency, formatCurrencyCompact, useCurrency } from "@/utils/formatCurrency";
import { useToast } from "@/hooks/use-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  description?: string;
}

function MetricCard({ title, value, change, icon, trend, description }: MetricCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="rounded-2xl border-border/80 bg-card/90 shadow-card hover:border-primary/40 transition-all">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
              <p className="text-2xl sm:text-3xl font-black text-foreground">{value}</p>
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">{icon}</div>
          </div>

          {change !== undefined && (
            <div
              className={`mt-4 flex items-center gap-1 text-xs font-bold ${
                trend === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : trend === "down"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground"
              }`}
            >
              {trend === "up" && <ArrowUpRight className="h-4 w-4" />}
              {trend === "down" && <ArrowDownRight className="h-4 w-4" />}
              <span>{Math.abs(change)}% vs prior period</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [chartType, setChartType] = useState<"revenue" | "bookings">("revenue");
  const [selectedDay, setSelectedDay] = useState<number | null>(14);
  const [appliedStrategy, setAppliedStrategy] = useState(false);
  const { currency } = useCurrency();
  const { toast } = useToast();

  const { data: analyticsData } = useApiAdvanced<any>(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/analytics?range=${timeRange}`,
    { debounceMs: 300 }
  );

  // Revenue & bookings trend chart data
  const revenueTrendData = [
    { name: "Apr", revenue: 185000, bookings: 12, occupancy: 65 },
    { name: "May", revenue: 240000, bookings: 16, occupancy: 72 },
    { name: "Jun", revenue: 380000, bookings: 24, occupancy: 88 },
    { name: "Jul", revenue: 490000, bookings: 31, occupancy: 94 },
    { name: "Aug", revenue: 430000, bookings: 27, occupancy: 85 },
    { name: "Sep", revenue: 524000, bookings: 35, occupancy: 91 },
  ];

  // 30-Day Heatmap Mock Calendar Data
  const heatmapDays = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    // Status distribution
    let status: "booked" | "available" | "blocked" = "available";
    let guest = "";
    let rate = 14500;

    if ([1, 2, 5, 6, 7, 12, 13, 14, 15, 16, 20, 21, 22, 26, 27, 28, 29].includes(day)) {
      status = "booked";
      guest = ["Alex Rivera", "Priya Sharma", "David Kim", "Marcus Vance", "Elena Rostova"][day % 5];
      rate = [16500, 18000, 14500, 19500][day % 4];
    } else if ([8, 9, 23].includes(day)) {
      status = "blocked";
    }

    return { day, status, guest, rate };
  });

  const bookedCount = heatmapDays.filter((d) => d.status === "booked").length;
  const occupancyPct = Math.round((bookedCount / 30) * 100);

  const selectedDayInfo = heatmapDays.find((d) => d.day === selectedDay);

  const handleApplyStrategy = () => {
    setAppliedStrategy(true);
    toast({
      title: "Smart Pricing Strategy Applied! ⚡",
      description: "Weekend rates increased by +18% and Mon-Wed discounts enabled across your listings.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
                <Sparkles className="h-3.5 w-3.5" /> Host Performance Center
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">Host Analytics</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time listing revenue, occupancy heatmap, and AI dynamic pricing suggestions.
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center rounded-2xl border border-border bg-card p-1 shadow-sm self-start sm:self-auto">
              {(["week", "month", "year"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    timeRange === range
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(524000)}
            change={14.8}
            trend="up"
            icon={<DollarSign className="h-6 w-6" />}
            description="Gross earnings this period"
          />

          <MetricCard
            title="Bookings Confirmed"
            value="35 Stays"
            change={9.2}
            trend="up"
            icon={<Calendar className="h-6 w-6" />}
            description="100% verified guests"
          />

          <MetricCard
            title="Occupancy Rate"
            value={`${occupancyPct}%`}
            change={5.4}
            trend="up"
            icon={<Home className="h-6 w-6" />}
            description="22 of 30 nights booked"
          />

          <MetricCard
            title="Avg Guest Rating"
            value="4.92 ★"
            change={2.1}
            trend="up"
            icon={<Star className="h-6 w-6" />}
            description="From 142 verified reviews"
          />
        </div>

        {/* Interactive Charts & Heatmap Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue & Bookings Trend Chart */}
          <Card className="lg:col-span-7 rounded-2xl border-border/80 bg-card/90 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold">Earnings & Growth Velocity</CardTitle>
                <CardDescription>Monthly trajectory with currency conversion</CardDescription>
              </div>
              <div className="flex gap-1.5 rounded-xl border border-border bg-muted/40 p-1">
                <button
                  onClick={() => setChartType("revenue")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    chartType === "revenue"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setChartType("bookings")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    chartType === "bookings"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Bookings
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "revenue" ? (
                    <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(v) => formatCurrencyCompact(v)}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#revenueGrad)"
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        formatter={(value: number) => [`${value} reservations`, "Bookings"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                      />
                      <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs text-muted-foreground">
                <span>Peak month: Sep ({formatCurrency(524000)})</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  +38% vs summer baseline
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 30-Day Interactive Occupancy Heatmap */}
          <Card className="lg:col-span-5 rounded-2xl border-border/80 bg-card/90 shadow-card flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">30-Day Occupancy Heatmap</CardTitle>
                  <CardDescription>Click any day to inspect guest & pricing</CardDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
                  {occupancyPct}% Booked
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between pt-2">
              {/* Heatmap Legend */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" /> Booked ({bookedCount})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-muted border border-border" /> Available (
                  {30 - bookedCount - 3})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500" /> Blocked (3)
                </span>
              </div>

              {/* 30-Day Grid */}
              <div className="grid grid-cols-6 gap-2">
                {heatmapDays.map((item) => {
                  const isSelected = selectedDay === item.day;
                  let bgClass = "bg-muted/40 border-border text-foreground hover:border-primary/50";
                  if (item.status === "booked") {
                    bgClass = isSelected
                      ? "bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400"
                      : "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30";
                  } else if (item.status === "blocked") {
                    bgClass = isSelected
                      ? "bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-400"
                      : "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300";
                  } else if (isSelected) {
                    bgClass = "bg-primary text-primary-foreground border-primary ring-2 ring-primary/40";
                  }

                  return (
                    <button
                      key={item.day}
                      onClick={() => setSelectedDay(item.day)}
                      className={`relative flex flex-col items-center justify-center rounded-xl border p-2 text-xs font-bold transition-all ${bgClass}`}
                    >
                      <span>{item.day}</span>
                      <span className="text-[9px] font-normal opacity-80">
                        {item.status === "booked" ? "●" : item.status === "blocked" ? "✕" : "○"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Details Card */}
              {selectedDayInfo && (
                <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Day {selectedDayInfo.day} Breakdown</span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-bold ${
                        selectedDayInfo.status === "booked"
                          ? "bg-emerald-500/20 text-emerald-600"
                          : selectedDayInfo.status === "blocked"
                          ? "bg-rose-500/20 text-rose-600"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {selectedDayInfo.status.toUpperCase()}
                    </Badge>
                  </div>

                  {selectedDayInfo.status === "booked" ? (
                    <div className="mt-2 flex items-center justify-between text-muted-foreground">
                      <span>Guest: <strong className="text-foreground">{selectedDayInfo.guest}</strong></span>
                      <span>Rate: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedDayInfo.rate)}</strong>/night</span>
                    </div>
                  ) : selectedDayInfo.status === "blocked" ? (
                    <p className="mt-1 text-muted-foreground">Blocked for scheduled villa upkeep and pool inspection.</p>
                  ) : (
                    <div className="mt-2 flex items-center justify-between text-muted-foreground">
                      <span>Status: Open for instant reservation</span>
                      <span>Suggested: <strong className="text-primary">{formatCurrency(14500)}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Pricing AI Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border-primary/30 bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent shadow-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <CardTitle className="text-lg font-bold">AI Smart Pricing & Demand Optimizer</CardTitle>
                </div>
                <CardDescription>Automated rate adjustments based on local events & group booking velocity</CardDescription>
              </div>

              <Button
                onClick={handleApplyStrategy}
                disabled={appliedStrategy}
                className="gap-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow-md self-start sm:self-auto"
              >
                {appliedStrategy ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                {appliedStrategy ? "Strategy Applied ✓" : "1-Click Apply Strategy"}
              </Button>
            </CardHeader>

            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Weekend Surge</span>
                  <Badge className="bg-emerald-500/20 text-emerald-600 border-none font-bold text-xs">+18%</Badge>
                </div>
                <p className="font-bold text-sm text-foreground">High Weekend Tourist Volume</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Friday-Sunday demand in your region is up 32%. Increasing nightly rates by +18% will net an extra{" "}
                  {formatCurrency(38000)} monthly with 0 drop in bookings.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">Midweek Promo</span>
                  <Badge className="bg-blue-500/20 text-blue-600 border-none font-bold text-xs">-8% Promo</Badge>
                </div>
                <p className="font-bold text-sm text-foreground">Fill Tuesday & Wednesday Gaps</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Offer a slight discount for 3+ night bookings spanning Tue-Wed to convert remote workers and digital nomads.
                </p>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase">Group Multiplier</span>
                  <Badge className="bg-purple-500/20 text-purple-600 border-none font-bold text-xs">Tiered Split</Badge>
                </div>
                <p className="font-bold text-sm text-foreground">Squad Booking Incentive</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Groups of 6+ have 94% instant confirmation rate on SplitsVilla. Keep per-person price under{" "}
                  {formatCurrency(3500)} to maximize conversion.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
