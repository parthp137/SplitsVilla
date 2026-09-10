import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plane,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Palmtree,
  Mountain,
  Castle,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCreateTrip } from "@/hooks/useApi";
import { formatCurrency } from "@/utils/formatCurrency";

interface DestinationPreset {
  name: string;
  country: string;
  tag: string;
  emoji: string;
  image: string;
  suggestedTitle: string;
}

const TRENDING_DESTINATIONS: DestinationPreset[] = [
  {
    name: "Goa",
    country: "India",
    tag: "Beaches & Nightlife",
    emoji: "🏖️",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600",
    suggestedTitle: "Goa Beach & Sun Getaway 🏖️",
  },
  {
    name: "Manali",
    country: "India",
    tag: "Mountains & Snow",
    emoji: "🏔️",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600",
    suggestedTitle: "Himalayan Mountain Retreat 🏔️",
  },
  {
    name: "Jaipur",
    country: "India",
    tag: "Heritage & Palaces",
    emoji: "🏰",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600",
    suggestedTitle: "Royal Jaipur Heritage Tour 🏰",
  },
  {
    name: "Bali",
    country: "Indonesia",
    tag: "Tropical & Villas",
    emoji: "🌴",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600",
    suggestedTitle: "Bali Tropical Villa Vacation 🌴",
  },
];

const BUDGET_TIERS = [
  { label: "Backpacker", amount: 6000, desc: "Budget stays, hostels, shared cabs" },
  { label: "Balanced", amount: 15000, desc: "Private villas, dining out, excursions" },
  { label: "Luxury", amount: 35000, desc: "Premium luxury resorts & private dining" },
];

export default function CreateTrip() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledDest = searchParams.get("destination") || "";
  const { toast } = useToast();
  const { mutateAsync: createTrip, isPending } = useCreateTrip();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [form, setForm] = useState({
    title: prefilledDest ? `${prefilledDest} Group Adventure 🏖️` : "",
    destination: prefilledDest || "",
    country: "India",
    checkIn: "",
    checkOut: "",
    groupSize: 4,
    budgetPerPerson: 15000,
    currency: "INR",
  });

  const update = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }));

  const calculateNights = () => {
    if (!form.checkIn || !form.checkOut) return 3;
    const start = new Date(form.checkIn).getTime();
    const end = new Date(form.checkOut).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const selectDestinationPreset = (dest: DestinationPreset) => {
    setForm((p) => ({
      ...p,
      destination: dest.name,
      country: dest.country,
      title: p.title || dest.suggestedTitle,
    }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!form.destination.trim()) {
        toast({ title: "Please pick or enter a destination", variant: "destructive" });
        return;
      }
      if (!form.title.trim()) {
        setForm((p) => ({ ...p, title: `${p.destination} Group Escape 🚀` }));
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!form.checkIn || !form.checkOut) {
        toast({ title: "Please select both check-in and check-out dates", variant: "destructive" });
        return;
      }
      if (new Date(form.checkOut) <= new Date(form.checkIn)) {
        toast({ title: "Check-out date must be after check-in", variant: "destructive" });
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const trip = await createTrip({
        ...form,
        groupSize: Number(form.groupSize),
        budgetPerPerson: Number(form.budgetPerPerson),
      });

      if (!trip || !trip.id) {
        toast({
          title: "Trip created but missing ID",
          description: "There was an issue retrieving your trip. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Trip created! 🎉", description: `"${trip.title}" is ready for your group!` });
      navigate(`/trips/${trip.id}`);
    } catch (error: any) {
      toast({
        title: "Failed to create trip",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const nights = calculateNights();
  const totalEstimatedGroupSpend = form.budgetPerPerson * form.groupSize;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8 space-y-8">
        {/* Header with Step Indicator */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-violet-600 text-white shadow-lg">
            <Plane className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-foreground">Plan a New Group Trip</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Launch your collaborative stay voting and expense hub in 3 quick steps
            </p>
          </div>

          {/* Progress Step Bar */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[
              { num: 1, label: "Destination" },
              { num: 2, label: "Squad & Dates" },
              { num: 3, label: "Budget & Launch" },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    currentStep === s.num
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-sm"
                      : currentStep > s.num
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > s.num ? <Check className="h-3.5 w-3.5" /> : s.num}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    currentStep === s.num ? "text-foreground font-bold" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
                {s.num < 3 && <div className="h-px w-6 sm:w-10 bg-border" />}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Form Container */}
        <div className="rounded-3xl border border-border/80 bg-card/80 p-6 sm:p-8 shadow-card backdrop-blur-sm">
          {/* STEP 1: DESTINATION & VIBE */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="font-heading text-xl font-bold text-foreground">Where are you heading?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pick a trending spot or type in any city across the world.
                </p>
              </div>

              {/* Trending Destinations Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TRENDING_DESTINATIONS.map((dest) => {
                  const isSelected = form.destination.toLowerCase() === dest.name.toLowerCase();
                  return (
                    <div
                      key={dest.name}
                      onClick={() => selectDestinationPreset(dest)}
                      className={`group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/40 scale-105 shadow-md"
                          : "border-transparent opacity-85 hover:opacity-100 hover:scale-[1.02]"
                      }`}
                    >
                      <img src={dest.image} alt={dest.name} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <span className="text-xs font-bold block">{dest.emoji} {dest.name}</span>
                        <span className="text-[10px] text-white/80 block truncate">{dest.tag}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Destination Inputs */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Destination City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={form.destination}
                      onChange={(e) => update("destination", e.target.value)}
                      placeholder="e.g. Goa, Rishikesh, Dubai"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Country</label>
                  <Input
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    placeholder="India"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Trip Name *</label>
                <Input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Goa Sun & Chill Trip 🏖️"
                  required
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button onClick={handleNextStep} className="gap-2 shadow-sm">
                  Continue to Dates & Squad <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: SQUAD & DATES */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="font-heading text-xl font-bold text-foreground">When is the trip and who's coming?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set your travel dates and group headcount to calculate accurate per-person estimates.
                </p>
              </div>

              {/* Group Size Stepper */}
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-foreground block">Travelling Group Size</span>
                    <span className="text-xs text-muted-foreground">How many co-travellers in your squad?</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => update("groupSize", Math.max(1, form.groupSize - 1))}
                      className="h-8 w-8 rounded-full border border-border bg-card font-bold flex items-center justify-center hover:bg-muted"
                    >
                      -
                    </button>
                    <span className="font-heading font-black text-xl text-primary w-6 text-center">
                      {form.groupSize}
                    </span>
                    <button
                      type="button"
                      onClick={() => update("groupSize", Math.min(30, form.groupSize + 1))}
                      className="h-8 w-8 rounded-full border border-border bg-card font-bold flex items-center justify-center hover:bg-muted"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Simulated squad avatars */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {Array.from({ length: Math.min(form.groupSize, 8) }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-full bg-gradient-to-tr from-primary to-violet-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-card"
                      >
                        {i === 0 ? "You" : `F${i}`}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {form.groupSize} friends in the group
                  </span>
                </div>
              </div>

              {/* Date Pickers */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Check-in Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="date"
                      value={form.checkIn}
                      onChange={(e) => update("checkIn", e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Check-out Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="date"
                      value={form.checkOut}
                      onChange={(e) => update("checkOut", e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>

              {form.checkIn && form.checkOut && (
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs text-primary flex items-center justify-between">
                  <span>Duration: <strong>{nights} nights</strong></span>
                  <span>Destination: <strong>{form.destination}</strong></span>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNextStep} className="gap-2 shadow-sm">
                  Continue to Budget <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: BUDGET & LAUNCH */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="font-heading text-xl font-bold text-foreground">Set Target Budget & Review</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure an estimated spending goal per person for automated AI budget tracking.
                </p>
              </div>

              {/* Budget Preset Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUDGET_TIERS.map((tier) => {
                  const isSelected = form.budgetPerPerson === tier.amount;
                  return (
                    <div
                      key={tier.label}
                      onClick={() => update("budgetPerPerson", tier.amount)}
                      className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/80 bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{tier.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="font-heading text-lg font-extrabold text-primary mt-1">
                        {formatCurrency(tier.amount)}
                        <span className="text-xs font-normal text-muted-foreground">/pers</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{tier.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Custom Budget Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Or Enter Custom Budget / Person (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1000"
                    step="500"
                    value={form.budgetPerPerson}
                    onChange={(e) => update("budgetPerPerson", Number(e.target.value))}
                    className="pl-9 font-bold"
                  />
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="rounded-2xl bg-muted/50 border border-border/80 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Squad Estimated Budget:</span>
                  <span className="font-heading text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalEstimatedGroupSpend)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground pt-1.5 border-t border-border/50">
                  <span>{form.groupSize} Travellers · {nights} Nights</span>
                  <span className="font-medium text-foreground">{form.destination}, {form.country}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button type="submit" disabled={isPending} className="gap-2 bg-gradient-to-r from-primary to-violet-600 shadow-md">
                  <Sparkles className="h-4 w-4" />
                  {isPending ? "Creating Trip Hub..." : "Launch Group Trip 🚀"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
