import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Property, VoteSummary } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";
import { Star, Users, MapPin, Check, X, ThumbsUp, Sparkles, Bed, Bath, ArrowRight } from "lucide-react";

interface PropertyFaceOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyA: Property | null;
  propertyB: Property | null;
  voteSummaryA?: VoteSummary;
  voteSummaryB?: VoteSummary;
  groupSize: number;
  onSelectProperty?: (property: Property) => void;
}

export function PropertyFaceOffModal({
  isOpen,
  onClose,
  propertyA,
  propertyB,
  voteSummaryA,
  voteSummaryB,
  groupSize,
  onSelectProperty,
}: PropertyFaceOffModalProps) {
  if (!propertyA || !propertyB) return null;

  const perPersonA = Math.round(propertyA.pricePerNight / Math.max(groupSize, 1));
  const perPersonB = Math.round(propertyB.pricePerNight / Math.max(groupSize, 1));
  const priceDiff = Math.abs(perPersonA - perPersonB);
  const cheaperOne = perPersonA < perPersonB ? "A" : perPersonA > perPersonB ? "B" : "Equal";

  // Combine unique amenities
  const allAmenities = Array.from(
    new Set([...(propertyA.amenities || []), ...(propertyB.amenities || [])])
  ).slice(0, 10);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/80 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold font-heading">
                Property Face-Off & Comparison
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Compare top contenders side-by-side to finalize the best stay for your group.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Quick comparison highlight bar */}
          <div className="rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-3.5 border border-primary/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-background font-semibold text-primary">
                Quick Insight
              </Badge>
              {cheaperOne !== "Equal" ? (
                <span>
                  <strong>{cheaperOne === "A" ? propertyA.title : propertyB.title}</strong> saves{" "}
                  <strong className="text-emerald-500 font-bold">{formatCurrency(priceDiff)}/person</strong> per night.
                </span>
              ) : (
                <span>Both properties have identical per-person nightly costs.</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Group size: <strong>{groupSize} guests</strong></span>
            </div>
          </div>

          {/* Side by side grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Center VS pill badge for desktop */}
            <div className="hidden md:flex absolute left-1/2 top-28 -translate-x-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-background border-2 border-primary shadow-lg font-black text-xs text-primary">
              VS
            </div>

            {/* Property A Column */}
            <div className="rounded-2xl border border-border/80 bg-card/70 p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-inner">
                  <img
                    src={propertyA.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"}
                    alt={propertyA.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-background/90 text-foreground backdrop-blur-md shadow-sm font-medium">
                      {propertyA.type}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                    <ThumbsUp className="h-3 w-3 text-emerald-400" />
                    <span>{voteSummaryA?.up || 0} Votes</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading font-bold text-base line-clamp-1">{propertyA.title}</h3>
                    <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs shrink-0">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <span>{propertyA.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {propertyA.location?.city}, {propertyA.location?.country}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-2.5 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Per Person</span>
                    <span className="font-bold text-primary text-sm">{formatCurrency(perPersonA)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Max Guests</span>
                    <span className="font-semibold text-foreground flex items-center justify-center gap-0.5 mt-0.5">
                      <Users className="h-3 w-3 text-muted-foreground" /> {propertyA.maxGuests}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Bed / Bath</span>
                    <span className="font-semibold text-foreground flex items-center justify-center gap-0.5 mt-0.5">
                      <Bed className="h-3 w-3 text-muted-foreground" /> {propertyA.bedrooms} / {propertyA.bathrooms}
                    </span>
                  </div>
                </div>
              </div>

              {onSelectProperty && (
                <Button
                  className="w-full mt-4 gap-2"
                  onClick={() => {
                    onSelectProperty(propertyA);
                    onClose();
                  }}
                >
                  Choose {propertyA.title.slice(0, 16)}... <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Property B Column */}
            <div className="rounded-2xl border border-border/80 bg-card/70 p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-inner">
                  <img
                    src={propertyB.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"}
                    alt={propertyB.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-background/90 text-foreground backdrop-blur-md shadow-sm font-medium">
                      {propertyB.type}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                    <ThumbsUp className="h-3 w-3 text-emerald-400" />
                    <span>{voteSummaryB?.up || 0} Votes</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading font-bold text-base line-clamp-1">{propertyB.title}</h3>
                    <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs shrink-0">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <span>{propertyB.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {propertyB.location?.city}, {propertyB.location?.country}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-2.5 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Per Person</span>
                    <span className="font-bold text-primary text-sm">{formatCurrency(perPersonB)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Max Guests</span>
                    <span className="font-semibold text-foreground flex items-center justify-center gap-0.5 mt-0.5">
                      <Users className="h-3 w-3 text-muted-foreground" /> {propertyB.maxGuests}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Bed / Bath</span>
                    <span className="font-semibold text-foreground flex items-center justify-center gap-0.5 mt-0.5">
                      <Bed className="h-3 w-3 text-muted-foreground" /> {propertyB.bedrooms} / {propertyB.bathrooms}
                    </span>
                  </div>
                </div>
              </div>

              {onSelectProperty && (
                <Button
                  className="w-full mt-4 gap-2"
                  variant="outline"
                  onClick={() => {
                    onSelectProperty(propertyB);
                    onClose();
                  }}
                >
                  Choose {propertyB.title.slice(0, 16)}... <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Side-by-side Amenities Matrix Table */}
          <div className="rounded-xl border border-border/80 overflow-hidden text-xs">
            <div className="bg-muted/60 px-4 py-2.5 font-semibold text-foreground border-b border-border/80 flex justify-between">
              <span>Amenities Comparison</span>
              <span className="text-muted-foreground font-normal">Feature match</span>
            </div>
            <div className="divide-y divide-border/40">
              {allAmenities.map((amenity) => {
                const hasA = propertyA.amenities?.includes(amenity);
                const hasB = propertyB.amenities?.includes(amenity);
                return (
                  <div key={amenity} className="grid grid-cols-3 px-4 py-2 items-center hover:bg-muted/20">
                    <div className="flex items-center gap-1.5">
                      {hasA ? (
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                      )}
                      <span className={hasA ? "text-foreground font-medium" : "text-muted-foreground line-through opacity-60"}>
                        {hasA ? "Included" : "No"}
                      </span>
                    </div>
                    <div className="text-center font-medium text-foreground">{amenity}</div>
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={hasB ? "text-foreground font-medium" : "text-muted-foreground line-through opacity-60"}>
                        {hasB ? "Included" : "No"}
                      </span>
                      {hasB ? (
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PropertyFaceOffModal;
