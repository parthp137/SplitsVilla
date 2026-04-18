import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useBookings,
  useBooking,
  useCancelBooking,
  useCreateReview,
} from "@/hooks/useApi";
import type { Booking, Property } from "@/types";

const statusStyle: Record<string, string> = { confirmed: "bg-success/10 text-success", completed: "bg-muted text-muted-foreground", cancelled: "bg-destructive/10 text-destructive", pending: "bg-warning/10 text-warning" };

function getBookingProperty(booking: Booking | any): Property | undefined {
  if (booking?.property && typeof booking.property === "object") {
    return booking.property as Property;
  }
  if (booking?.propertyId && typeof booking.propertyId === "object") {
    return booking.propertyId as Property;
  }
  return undefined;
}

const localBookingsKey = "sv_local_bookings";

export default function Bookings() {
  const { toast } = useToast();
  const { data: bookings = [], isLoading } = useBookings();
  const { mutateAsync: requestCancellation, isPending: isRequestingCancellation } = useCancelBooking();
  const { mutateAsync: createReview, isPending: isSubmittingReview } = useCreateReview();

  const [detailsBookingId, setDetailsBookingId] = useState<string | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [localBookings, setLocalBookings] = useState<any[]>([]);

  const shouldFetchBookingDetails = !!detailsBookingId && !detailsBookingId.startsWith("local-");
  const { data: detailBooking, isLoading: isDetailsLoading } = useBooking(shouldFetchBookingDetails ? detailsBookingId : undefined);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(localBookingsKey) || "[]");
      setLocalBookings(Array.isArray(saved) ? saved : []);
    } catch {
      setLocalBookings([]);
    }
  }, []);

  const sortedBookings = useMemo(
    () =>
      [...bookings, ...localBookings].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [bookings, localBookings]
  );

  const activeDetailsBooking = useMemo(
    () => sortedBookings.find((booking) => booking.id === detailsBookingId),
    [sortedBookings, detailsBookingId]
  );

  const handleRequestCancellation = async (bookingId: string) => {
    try {
      if (bookingId.startsWith("local-")) {
        const updated = localBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
        );
        localStorage.setItem(localBookingsKey, JSON.stringify(updated));
        setLocalBookings(updated);
        toast({
          title: "Cancellation requested",
          description: "Your booking status has been updated.",
        });
        setDetailsBookingId(null);
        return;
      }

      await requestCancellation(bookingId);
      toast({
        title: "Cancellation requested",
        description: "Your booking status has been updated.",
      });
      setDetailsBookingId(null);
    } catch (error: any) {
      toast({
        title: "Cancellation failed",
        description: error?.message || "Unable to request cancellation right now.",
        variant: "destructive",
      });
    }
  };

    const confirmCancellation = async () => {
      if (!cancelBookingId) return;
      await handleRequestCancellation(cancelBookingId);
      setCancelBookingId(null);
    };

  const handleSubmitReview = async () => {
    if (!reviewBooking) return;
    const property = getBookingProperty(reviewBooking);
    if (!property?.id) {
      toast({
        title: "Cannot submit review",
        description: "Property details are missing for this booking.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createReview({
        propertyId: property.id,
        bookingId: reviewBooking.id,
        rating,
        comment,
        categories: {
          cleanliness: rating,
          accuracy: rating,
          communication: rating,
          location: rating,
          checkin: rating,
          value: rating,
        },
      });

      toast({
        title: "Review submitted",
        description: "Thanks for sharing your experience.",
      });
      setReviewBooking(null);
      setRating(5);
      setComment("");
    } catch (error: any) {
      toast({
        title: "Review failed",
        description: error?.message || "Could not submit review.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">My Bookings</h1>
        <div className="mt-8 space-y-4">
          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading bookings...</div>
          ) : sortedBookings.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">No bookings yet.</div>
          ) : (
            sortedBookings.map((b) => {
              const property = getBookingProperty(b);
              return (
                <div key={b.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row">
                  <img
                    src={property?.images?.[0] || "https://via.placeholder.com/320x200?text=Property"}
                    alt={property?.title || "Booked property"}
                    className="h-32 w-44 shrink-0 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-heading text-lg font-bold text-foreground">
                        {property?.title || "Property"}
                      </h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[b.status] || "bg-muted text-muted-foreground"}`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {property?.location?.city || "Unknown city"} · {b.nights} nights · {b.guests} guests
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(b.checkIn).toLocaleDateString()} — {new Date(b.checkOut).toLocaleDateString()}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="font-heading text-lg font-bold text-foreground">{formatCurrency(b.totalPrice)}</span>
                      <div className="flex flex-wrap gap-2">
                        <Dialog
                          open={detailsBookingId === b.id}
                          onOpenChange={(open) => setDetailsBookingId(open ? b.id : null)}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Check Details</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Booking Details</DialogTitle>
                            </DialogHeader>
                            {detailsBookingId?.startsWith("local-") ? (
                              activeDetailsBooking ? (
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">{getBookingProperty(activeDetailsBooking)?.title || "Property"}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(activeDetailsBooking.checkIn).toLocaleDateString()} — {new Date(activeDetailsBooking.checkOut).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="grid gap-2 text-sm text-muted-foreground">
                                    <p><span className="font-medium text-foreground">Guests:</span> {activeDetailsBooking.guests}</p>
                                    <p><span className="font-medium text-foreground">Nights:</span> {activeDetailsBooking.nights}</p>
                                    <p><span className="font-medium text-foreground">Status:</span> {activeDetailsBooking.status}</p>
                                    <p><span className="font-medium text-foreground">Total:</span> {formatCurrency(activeDetailsBooking.totalPrice)}</p>
                                    <p><span className="font-medium text-foreground">Booked On:</span> {new Date(activeDetailsBooking.createdAt).toLocaleDateString()}</p>
                                  </div>

                                  {(activeDetailsBooking.status === "confirmed" || activeDetailsBooking.status === "pending") && (
                                    <Button
                                      variant="destructive"
                                      className="w-full"
                                      onClick={() => setCancelBookingId(activeDetailsBooking.id)}
                                      disabled={isRequestingCancellation}
                                    >
                                      Request Cancellation
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">Could not load booking details.</p>
                              )
                            ) : isDetailsLoading ? (
                              <p className="text-sm text-muted-foreground">Loading booking details...</p>
                            ) : detailBooking ? (
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{getBookingProperty(detailBooking)?.title || "Property"}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(detailBooking.checkIn).toLocaleDateString()} — {new Date(detailBooking.checkOut).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="grid gap-2 text-sm text-muted-foreground">
                                  <p><span className="font-medium text-foreground">Guests:</span> {detailBooking.guests}</p>
                                  <p><span className="font-medium text-foreground">Nights:</span> {detailBooking.nights}</p>
                                  <p><span className="font-medium text-foreground">Status:</span> {detailBooking.status}</p>
                                  <p><span className="font-medium text-foreground">Total:</span> {formatCurrency(detailBooking.totalPrice)}</p>
                                  <p><span className="font-medium text-foreground">Booked On:</span> {new Date(detailBooking.createdAt).toLocaleDateString()}</p>
                                </div>

                                {(detailBooking.status === "confirmed" || detailBooking.status === "pending") && (
                                  <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => handleRequestCancellation(detailBooking.id)}
                                    disabled={isRequestingCancellation}
                                  >
                                    {isRequestingCancellation ? "Requesting..." : "Request Cancellation"}
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Could not load booking details.</p>
                            )}
                          </DialogContent>
                        </Dialog>

                        {b.status === "completed" && (
                          <Dialog
                            open={reviewBooking?.id === b.id}
                            onOpenChange={(open) => {
                              if (open) {
                                setReviewBooking(b);
                              } else {
                                setReviewBooking(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Star className="mr-1 h-3.5 w-3.5" /> Write Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Write a Review</DialogTitle>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-foreground">Rating</label>
                                  <select
                                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    value={rating}
                                    onChange={(e) => setRating(parseInt(e.target.value))}
                                  >
                                    <option value={5}>5 - Excellent</option>
                                    <option value={4}>4 - Very good</option>
                                    <option value={3}>3 - Good</option>
                                    <option value={2}>2 - Fair</option>
                                    <option value={1}>1 - Poor</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-foreground">Comment</label>
                                  <Textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share your experience..."
                                    className="mt-1"
                                  />
                                </div>

                                <Button onClick={handleSubmitReview} className="w-full" disabled={isSubmittingReview}>
                                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={!!cancelBookingId} onOpenChange={(open) => !open && setCancelBookingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will request cancellation for your booking. You can continue only if you want to proceed.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="w-full" onClick={() => setCancelBookingId(null)}>
                Keep Booking
              </Button>
              <Button variant="destructive" className="w-full" onClick={confirmCancellation} disabled={isRequestingCancellation}>
                {isRequestingCancellation ? "Cancelling..." : "Yes, Cancel"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
