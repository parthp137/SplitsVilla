import React, { useState } from "react";
import { Users, Sparkles, Share2, Copy, Check, MessageSquare, Plus, ArrowRight, DollarSign, Heart } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Property, Trip } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";
import { useToast } from "@/hooks/use-toast";

interface GroupCostCalculatorProps {
  property: Property;
  userTrips?: Trip[];
  onShortlistToTrip?: (tripId: string) => void;
  isShortlisting?: boolean;
}

export function GroupCostCalculator({
  property,
  userTrips = [],
  onShortlistToTrip,
  isShortlisting = false,
}: GroupCostCalculatorProps) {
  const { toast } = useToast();
  const maxCapacity = Math.max(property.maxGuests || 6, 2);
  const [friendsCount, setFriendsCount] = useState(Math.min(4, maxCapacity));
  const [nightsCount, setNightsCount] = useState(3);
  const [copied, setCopied] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(userTrips[0]?.id || "");

  const pricePerNight = property.pricePerNight || 0;
  const totalStayCost = pricePerNight * nightsCount;
  const costPerPersonPerNight = Math.round(pricePerNight / Math.max(friendsCount, 1));
  const totalCostPerPerson = Math.round(totalStayCost / Math.max(friendsCount, 1));

  const shareText = `🏖️ Found this stay for our trip: "${property.title}" in ${property.location?.city || "Goa"}!
💰 Nightly Price: ${formatCurrency(pricePerNight)} total
👥 Split for ${friendsCount} friends: only ${formatCurrency(costPerPersonPerNight)}/person per night (${formatCurrency(totalCostPerPerson)} each for ${nightsCount} nights).
Check it out on SplitsVilla!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast({ title: "Summary copied to clipboard!", description: "Paste it directly in your group chat." });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card/80 to-background p-5 shadow-sm space-y-4 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </span>
          <h3 className="font-heading font-bold text-sm text-foreground">Group Split Calculator</h3>
        </div>
        <Badge variant="outline" className="bg-background text-[11px] font-semibold text-primary border-primary/30">
          Max {maxCapacity} Guests
        </Badge>
      </div>

      {/* Interactive Controls */}
      <div className="space-y-3 pt-1">
        {/* Friends Count Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-foreground">
            <span>Travelling Group Size</span>
            <span className="text-primary font-bold">{friendsCount} friends</span>
          </div>
          <Slider
            value={[friendsCount]}
            min={1}
            max={maxCapacity}
            step={1}
            onValueChange={(val) => setFriendsCount(val[0])}
            className="cursor-pointer"
          />
        </div>

        {/* Nights Selector */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-foreground">
            <span>Trip Duration</span>
            <span className="text-primary font-bold">{nightsCount} nights</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[2, 3, 5, 7].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNightsCount(n)}
                className={`rounded-lg py-1 text-xs font-semibold transition-all ${
                  nightsCount === n
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {n} nights
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calculated Result Breakdown Pill */}
      <div className="rounded-xl border border-border/70 bg-card/90 p-3.5 space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">Each person pays per night:</span>
          <span className="font-heading text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(costPerPersonPerNight)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
          <span>Total for {nightsCount} nights ({friendsCount} people):</span>
          <span className="font-semibold text-foreground">{formatCurrency(totalCostPerPerson)}/person</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 border-border/80"
          onClick={() => setOpenShareModal(true)}
        >
          <Share2 className="h-3.5 w-3.5" /> Share Split
        </Button>

        {userTrips.length > 0 && onShortlistToTrip ? (
          <Button
            size="sm"
            className="text-xs gap-1.5 bg-gradient-to-r from-primary to-violet-600"
            onClick={() => onShortlistToTrip(selectedTripId || userTrips[0]?.id)}
            disabled={isShortlisting}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isShortlisting ? "Adding..." : "Add to Trip"}
          </Button>
        ) : (
          <Button
            size="sm"
            className="text-xs gap-1.5"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Breakdown"}
          </Button>
        )}
      </div>

      {/* Share Modal */}
      <Dialog open={openShareModal} onOpenChange={setOpenShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Share Group Cost Breakdown</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="rounded-xl bg-muted/60 p-3.5 text-xs text-foreground font-mono whitespace-pre-line border border-border/60">
              {shareText}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleWhatsApp} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <MessageSquare className="h-4 w-4" /> WhatsApp
              </Button>
              <Button onClick={handleCopy} variant="outline" className="gap-2">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Text"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GroupCostCalculator;
