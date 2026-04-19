import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Star, Heart, Share2, MapPin, Users, Bed, Bath, Home, Wifi, Car, Waves, UtensilsCrossed, Wind, ChevronLeft, AlertCircle, CheckCircle, CalendarDays, Loader2 } from "lucide-react";

import Footer from "@/components/common/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockProperties, mockReviews } from "@/utils/mockData";
import { formatCurrency } from "@/utils/formatCurrency";
import { useToast } from "@/hooks/use-toast";
import { useCreateBooking, useProperty, usePropertyReviews, useShortlistProperty, useTrips } from "@/hooks/useApi";

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-5 w-5" />, Pool: <Waves className="h-5 w-5" />, AC: <Wind className="h-5 w-5" />,
  Kitchen: <UtensilsCrossed className="h-5 w-5" />, Parking: <Car className="h-5 w-5" />,
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMongoId = /^[a-f\d]{24}$/i.test(id || "");
  const { data: apiProperty } = useProperty(isMongoId ? id : undefined);
  const fallbackProperty = mockProperties.find((p) => p.id === id) || mockProperties[0];
  const property = apiProperty || fallbackProperty;

  const { mutateAsync: createBooking, isPending: isCreatingBooking } = useCreateBooking();

  const { data: apiReviews = [] } = usePropertyReviews(isMongoId ? id : undefined);
  const reviews = isMongoId ? apiReviews : mockReviews.filter((r) => r.propertyId === property.id);
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [wishlisted, setWishlisted] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [tripMode, setTripMode] = useState<"none" | "attach">("none");
  const [selectedTripId, setSelectedTripId] = useState("");

  const localBookingsKey = "sv_local_bookings";

  const canUseApiBooking = useMemo(() => isMongoId && Boolean(apiProperty), [isMongoId, apiProperty]);
  const { data: trips = [] } = useTrips();
  const { mutateAsync: shortlistProperty, isPending: isShortlistingProperty } = useShortlistProperty();

  const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000) : 3;
  const total = property.pricePerNight * nights;
  const cleaningFee = 1500;
  const serviceFee = Math.round(total * 0.05);
  const grandTotal = total + cleaningFee + serviceFee;

  const handleShortlist = async () => {
    if (!selectedTripId) {
      setBookingError("Pick a trip first to save this stay.");
      return;
    }

    try {
      await shortlistProperty({ tripId: selectedTripId, propertyId: property.id });
      const selectedTrip = trips.find((trip) => trip.id === selectedTripId);
      toast({
        title: "Saved to trip shortlist",
        description: selectedTrip ? `${property.title} was added to ${selectedTrip.title}.` : "Property attached to your trip.",
      });
    } catch (error: any) {
      setBookingError(error?.message || "We could not save this property to the trip. Try again.");
    }
  };

  const validateBooking = (): boolean => {
    setBookingError(null);
    
    if (!checkIn || !checkOut) {
      setBookingError("Please select check-in and check-out dates");
      return false;
    }
    
    if (guests < 1 || guests > property.maxGuests) {
      setBookingError(`Guests must be between 1 and ${property.maxGuests}`);
      return false;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      setBookingError("Check-in date cannot be in the past");
      return false;
    }

    if (checkOutDate <= checkInDate) {
      setBookingError("Check-out date must be after check-in date");
      return false;
    }

    if (nights < 1) {
      setBookingError("Stay must be at least 1 night");
      return false;
    }

    return true;
  };

  const handleReserve = async () => {
    if (!validateBooking()) return;
    
    setIsBooking(true);
    try {
      const localBooking = {
        id: `local-${Date.now()}`,
        propertyId: property.id,
        property,
        guestId: "local-user",
        checkIn,
        checkOut,
        nights,
        guests,
        totalPrice: grandTotal,
        pricePerNight: property.pricePerNight,
        status: "confirmed",
        paymentStatus: "unpaid",
        createdAt: new Date().toISOString(),
      };

      if (canUseApiBooking) {
        await createBooking({
          propertyId: property.id,
          checkIn,
          checkOut,
          guests,
          tripId: tripMode === "attach" ? selectedTripId : undefined,
        });
      } else {
        const existing = JSON.parse(localStorage.getItem(localBookingsKey) || "[]");
        localStorage.setItem(localBookingsKey, JSON.stringify([{ ...localBooking, tripId: tripMode === "attach" ? selectedTripId : undefined }, ...existing]));
      }

      toast({ 
        title: "Booking confirmed! 🎉",
        description: tripMode === "attach" && selectedTripId
          ? `Reserved for ${nights} night${nights > 1 ? 's' : ''} and attached to your trip.`
          : `Reserved for ${nights} night${nights > 1 ? 's' : ''}, ${guests} guest${guests > 1 ? 's' : ''}`,
      });
      setCheckIn("");
      setCheckOut("");
      navigate(tripMode === "attach" && selectedTripId ? `/trips/${selectedTripId}` : "/bookings");
    } catch (error) {
      setBookingError("Booking failed. Please try again.");
      toast({ 
        title: "Booking failed",
        description: "Error processing your booking",
        variant: "destructive"
      });
      } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        {/* Title */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-foreground lg:text-3xl">{property.title}</h1>
            <div className="mt-1 flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 font-medium text-foreground"><Star className="h-4 w-4 fill-foreground" />{property.rating}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground underline">{property.reviewCount} reviews</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{property.location.city}, {property.location.country}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button onClick={() => setWishlisted(!wishlisted)} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent">
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-primary text-primary" : ""}`} /> Save
            </button>
          </div>
        </div>

        {/* Image gallery */}
        <div className="mt-4 grid gap-2 overflow-hidden rounded-2xl lg:grid-cols-4 lg:grid-rows-2">
          <div className="lg:col-span-2 lg:row-span-2">
            <img src={property.images[0]} alt={property.title} className="h-64 w-full object-cover lg:h-full" loading="lazy" />
          </div>
          {property.images.slice(1, 5).map((img, i) => (
            <div key={i}>
              <img src={img} alt="" className="h-32 w-full object-cover lg:h-full" loading="lazy" />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* Left */}
          <div className="flex-1 space-y-8">
            {/* Host & type */}
            <div className="flex items-center justify-between border-b border-border pb-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  {property.type.charAt(0).toUpperCase() + property.type.slice(1)} hosted by {property.hostName}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {property.maxGuests} guests · {property.bedrooms} bedrooms · {property.beds} beds · {property.bathrooms} baths
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {property.hostName[0]}
              </div>
            </div>

            {/* Description */}
            <div className="border-b border-border pb-6">
              <p className="text-sm leading-relaxed text-foreground">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="border-b border-border pb-6">
              <h3 className="font-heading text-xl font-bold text-foreground">What this place offers</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-3 text-sm text-foreground">
                    {amenityIcons[a] || <Home className="h-5 w-5 text-muted-foreground" />}
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h3 className="font-heading text-xl font-bold text-foreground">
                <Star className="mr-1 inline h-5 w-5 fill-foreground" />{property.rating} · {property.reviewCount} reviews
              </h3>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {reviews.map((r) => (
                  <div key={r.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
                        {r.guestName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{r.guestName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{r.comment}</p>
                    {r.hostReply && (
                      <div className="rounded-lg bg-muted p-3">
                        <p className="text-xs font-semibold text-foreground">Response from {property.hostName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{r.hostReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Booking card */}
          <div className="lg:w-[380px]">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-2xl font-extrabold text-foreground">{formatCurrency(property.pricePerNight)}</span>
                <span className="text-muted-foreground">night</span>
              </div>

              {/* Booking Error Alert */}
              {bookingError && (
                <div className="mt-4 flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                  <span className="text-destructive">{bookingError}</span>
                </div>
              )}

              <div className="mt-4 overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-2 divide-x divide-border">
                  <div className="p-3">
                    <label className="text-[10px] font-bold uppercase text-foreground">Check-in</label>
                    <Input 
                      type="date" 
                      value={checkIn} 
                      onChange={(e) => { setCheckIn(e.target.value); setBookingError(null); }}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 border-0 p-0 text-sm" 
                    />
                  </div>
                  <div className="p-3">
                    <label className="text-[10px] font-bold uppercase text-foreground">Check-out</label>
                    <Input 
                      type="date" 
                      value={checkOut} 
                      onChange={(e) => { setCheckOut(e.target.value); setBookingError(null); }}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="mt-1 border-0 p-0 text-sm" 
                    />
                  </div>
                </div>
                <div className="border-t border-border p-3">
                  <label className="text-[10px] font-bold uppercase text-foreground">Guests ({guests}/{property.maxGuests})</label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={property.maxGuests} 
                    value={guests} 
                    onChange={(e) => { setGuests(parseInt(e.target.value)); setBookingError(null); }}
                    className="mt-1 border-0 p-0 text-sm" 
                  />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Trip</p>
                    <p className="text-xs text-muted-foreground">Attach this stay to a trip or keep it as a standalone reservation.</p>
                  </div>
                  <Badge variant="outline">Optional</Badge>
                </div>

                <RadioGroup
                  value={tripMode}
                  onValueChange={(value) => {
                    const nextMode = value as "none" | "attach";
                    setTripMode(nextMode);
                    if (nextMode === "attach" && !selectedTripId) {
                      setSelectedTripId(trips[0]?.id || "");
                    }
                  }}
                  className="mt-3 gap-3"
                >
                  <label className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm">
                    <RadioGroupItem value="none" />
                    <div>
                      <p className="font-medium text-foreground">Reserve only</p>
                      <p className="text-xs text-muted-foreground">Best when you are booking for yourself.</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm">
                    <RadioGroupItem value="attach" />
                    <div>
                      <p className="font-medium text-foreground">Reserve and attach to a trip</p>
                      <p className="text-xs text-muted-foreground">Best when the whole group is already planning together.</p>
                    </div>
                  </label>
                </RadioGroup>

                {tripMode === "attach" && (
                  <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-foreground">Select trip</label>
                      <Select value={selectedTripId} onValueChange={setSelectedTripId}>
                        <SelectTrigger>
                          <SelectValue placeholder={trips.length ? "Choose a trip" : "No trips yet"} />
                        </SelectTrigger>
                        <SelectContent>
                          {trips.map((trip) => (
                            <SelectItem key={trip.id} value={trip.id}>
                              {trip.title} · {trip.destination}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-lg bg-background p-3 text-xs text-muted-foreground">
                      <span>{trips.length ? `${trips.length} trip${trips.length > 1 ? "s" : ""} available` : "No trips available yet"}</span>
                      <Link to="/create-trip" className="font-semibold text-primary hover:underline">
                        Create trip
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                className="mt-4 w-full rounded-xl py-6 text-base font-semibold" 
                onClick={handleReserve}
                disabled={isBooking || isCreatingBooking || !checkIn || !checkOut || (tripMode === "attach" && !selectedTripId)}
              >
                {isBooking || isCreatingBooking ? "Reserving..." : tripMode === "attach" ? "Reserve and attach" : "Reserve"}
              </Button>

              <Button 
                variant="outline" 
                className="mt-2 w-full rounded-xl py-5 text-sm" 
                onClick={() => {
                  if (!checkIn || !checkOut) {
                    setBookingError("Please select dates first before saving to a trip");
                    return;
                  }
                  if (!selectedTripId) {
                    setTripMode("attach");
                    setBookingError("Choose a trip first.");
                    return;
                  }
                  void handleShortlist();
                }}
                disabled={isShortlistingProperty || !checkIn || !checkOut}
              >
                {isShortlistingProperty ? "Saving..." : "Save to trip shortlist"}
              </Button>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{formatCurrency(property.pricePerNight)} × {nights} night{nights !== 1 ? 's' : ''}</span><span className="text-foreground">{formatCurrency(total)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cleaning fee</span><span className="text-foreground">{formatCurrency(cleaningFee)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span className="text-foreground">{formatCurrency(serviceFee)}</span></div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold"><span className="text-foreground">Total</span><span className="text-foreground">{formatCurrency(grandTotal)}</span></div>
                {guests > 1 && (
                  <p className="text-center text-sm font-semibold text-primary">
                    {formatCurrency(Math.round(grandTotal / guests))}/person
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
