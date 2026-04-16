import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApiAdvanced } from "@/hooks/useApiAdvanced";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  description?: string;
}

/**
 * Metric Card Component
 */
function MetricCard({ title, value, change, icon, trend, description }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <div className="p-3 rounded-lg bg-primary/10">{icon}</div>
          </div>

          {change !== undefined && (
            <div className={`mt-4 flex items-center gap-1 text-sm font-medium ${trend === "up" ? "text-green-600 dark:text-green-400" : trend === "down" ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
              {trend === "up" && <ArrowUpRight className="h-4 w-4" />}
              {trend === "down" && <ArrowDownRight className="h-4 w-4" />}
              {Math.abs(change)}% vs last month
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Analytics Dashboard Component
 * Shows key metrics for property hosts and admins
 */
export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  // Fetch analytics data
  const { data: analyticsData, loading, error } = useApiAdvanced<any>(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/analytics?range=${timeRange}`,
    { debounceMs: 300 }
  );

  // Mock data for demo
  const mockData = {
    totalProperties: "24",
    activeListings: "18",
    totalBookings: "156",
    totalRevenue: "₹5,24,000",
    avgRating: "4.8",
    totalGuests: "432",
    occupancyRate: "78%",
    mostBookedProperty: "Beachfront Villa",
    topReviewedProperty: "Mountain Retreat",
    revenueGrowth: 12,
    bookingGrowth: 8,
    guestGrowth: -3,
  };

  const stats = {
    revenue: { metric: analyticsData?.revenue || mockData.totalRevenue, change: mockData.revenueGrowth, trend: "up" as const },
    bookings: { metric: analyticsData?.bookings || mockData.totalBookings, change: mockData.bookingGrowth, trend: "up" as const },
    guests: { metric: analyticsData?.guests || mockData.totalGuests, change: mockData.guestGrowth, trend: "down" as const },
    properties: { metric: analyticsData?.properties || mockData.totalProperties, change: 5, trend: "up" as const },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Track your property performance and guest insights
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2">
              {(["week", "month", "year"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeRange === range
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={stats.revenue.metric}
            change={stats.revenue.change}
            trend={stats.revenue.trend}
            icon={<DollarSign className="h-6 w-6 text-primary" />}
            description="Total earned this period"
          />

          <MetricCard
            title="Total Bookings"
            value={stats.bookings.metric}
            change={stats.bookings.change}
            trend={stats.bookings.trend}
            icon={<Calendar className="h-6 w-6 text-primary" />}
            description="Confirmed reservations"
          />

          <MetricCard
            title="Total Guests"
            value={stats.guests.metric}
            change={stats.guests.change}
            trend={stats.guests.trend}
            icon={<Users className="h-6 w-6 text-primary" />}
            description="Guests hosted"
          />

          <MetricCard
            title="Active Properties"
            value={stats.properties.metric}
            change={stats.properties.change}
            trend={stats.properties.trend}
            icon={<Home className="h-6 w-6 text-primary" />}
            description="Currently listed"
          />
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Occupancy Rate */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Occupancy Rate
                </CardTitle>
                <CardDescription>This {timeRange}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall</span>
                      <span className="text-2xl font-bold">78%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: "78%" }}
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-primary/10 text-xs text-muted-foreground space-y-1">
                    <p>Target: 85% (+7%)</p>
                    <p>Industry avg: 72%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Rating */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Average Rating
                </CardTitle>
                <CardDescription>Guest satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-4xl font-bold">4.8</span>
                    <span className="text-muted-foreground"> / 5.0</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-lg">
                        {i < 4 ? "⭐" : "☆"}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on 142 reviews
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Properties */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Top Properties
                </CardTitle>
                <CardDescription>Most booked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Beachfront Villa", bookings: 24, rating: 4.9 },
                    { name: "Mountain Retreat", bookings: 18, rating: 4.8 },
                    { name: "City Penthouse", bookings: 15, rating: 4.7 },
                  ].map((prop) => (
                    <div key={prop.name} className="p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{prop.name}</span>
                        <Badge variant="secondary">{prop.bookings} bookings</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ⭐ {prop.rating} rating
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Insights & Recommendations</CardTitle>
              <CardDescription>Data-driven suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-green-900 dark:text-green-300">
                    Strong booking trend
                  </p>
                  <p className="text-xs text-green-800 dark:text-green-400 mt-0.5">
                    Your bookings are up 12% compared to last month. Consider adjusting pricing to maximize revenue.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <Star className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-blue-900 dark:text-blue-300">
                    High guest satisfaction
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-400 mt-0.5">
                    4.8 rating is excellent. Encourage guests to leave reviews to build social proof.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-amber-900 dark:text-amber-300">
                    Seasonal opportunity
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
                    Next month typically sees 20% more bookings. Update availability now to capture demand.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
