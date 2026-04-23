import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, DollarSign, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCreateTrip } from "@/hooks/useApi";

export default function CreateTrip() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: createTrip, isPending } = useCreateTrip();
  const [form, setForm] = useState({
    title: "", destination: "", country: "India",
    checkIn: "", checkOut: "", groupSize: 4, budgetPerPerson: 15000, currency: "INR",
  });

  const update = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.destination || !form.checkIn || !form.checkOut) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    try {
      console.log("📝 Creating trip with data:", form);
      const trip = await createTrip({
        ...form,
        groupSize: Number(form.groupSize),
        budgetPerPerson: Number(form.budgetPerPerson),
      });
      console.log("✅ Trip created:", trip);
      
      if (!trip || !trip.id) {
        console.error("❌ Trip response missing ID:", trip);
        toast({ 
          title: "Trip created but missing ID", 
          description: "There was an issue retrieving your trip. Please try again.", 
          variant: "destructive" 
        });
        return;
      }
      
      toast({ title: "Trip created! 🎉", description: `${trip.title} is ready to go!` });
      navigate(`/trips/${trip.id}`);
    } catch (error: any) {
      console.error("❌ Trip creation error:", error);
      toast({ 
        title: "Failed to create trip", 
        description: error?.message || "Please try again.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Plane className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mt-4 font-heading text-3xl font-extrabold text-foreground">Plan a New Trip</h1>
          <p className="mt-2 text-muted-foreground">Set up your group adventure in minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card lg:p-8">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Trip Name *</label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g., Goa Beach Getaway 🏖️" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Destination *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={form.destination} onChange={(e) => update("destination", e.target.value)} placeholder="e.g., Goa" className="pl-10" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Country</label>
              <Input value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="India" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Check-in *</label>
              <Input type="date" value={form.checkIn} onChange={(e) => update("checkIn", e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Check-out *</label>
              <Input type="date" value={form.checkOut} onChange={(e) => update("checkOut", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Group Size</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="number" min={2} max={20} value={form.groupSize} onChange={(e) => update("groupSize", parseInt(e.target.value))} className="pl-10" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Budget per Person (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="number" value={form.budgetPerPerson} onChange={(e) => update("budgetPerPerson", parseInt(e.target.value))} className="pl-10" />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full rounded-xl py-6 text-base font-semibold" disabled={isPending}>
            {isPending ? "Creating..." : "Create Trip 🚀"}
          </Button>
        </form>
      </div>
    </div>
  );
}
