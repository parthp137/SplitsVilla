import { useState } from "react";

import { BarChart3, Home, Star, Calendar, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockProperties } from "@/utils/mockData";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/property/PropertyCard";

export default function HostDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const stats = [
    { label: "Total Listings", value: "3", icon: Home },
    { label: "Total Bookings", value: "24", icon: Calendar },
    { label: "Total Revenue", value: formatCurrency(485000), icon: BarChart3 },
    { label: "Avg Rating", value: "4.88", icon: Star },
  ];

  const handleAddProperty = async () => {
    setLoading(true);
    try {
      // Simulate property submission
      await new Promise((r) => setTimeout(r, 800));
      toast({ title: "Property listing coming soon", description: "Add property feature will be available in the next update." });
    } catch (error) {
      toast({ title: "Failed to add property", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-extrabold text-foreground">Host Dashboard</h1>
          <Button className="rounded-full" onClick={handleAddProperty} disabled={loading}><Plus className="mr-2 h-4 w-4" /> {loading ? "Adding..." : "Add New Property"}</Button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className="h-5 w-5 text-primary" /></div>
              <p className="mt-2 font-heading text-2xl font-extrabold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
        <h2 className="mt-8 font-heading text-xl font-bold text-foreground">My Listings</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mockProperties.slice(0, 3).map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      </div>
    </div>
  );
}
