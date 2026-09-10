import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useJoinTripFromNotification,
  useNotificationTripPreview,
  useNotifications,
  useMarkAllNotificationsAsRead,
  useTrips,
} from "@/hooks/useApi";
import { formatDateRange, timeAgo } from "@/utils/formatDate";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Check, CheckCircle2, ThumbsUp, ThumbsDown, Receipt, Sparkles, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/formatCurrency";
import { Badge } from "@/components/ui/badge";

type NotificationTripPreview = {
  trip: {
    id: string;
    title: string;
    destination: string;
    country: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    groupSize: number;
    currentMembers: number;
    budgetPerPerson: number;
    currency: string;
    status: string;
  };
  alreadyMember: boolean;
  inviteExpiresAt: string | null;
};

const typeIcons: Record<string, string> = {
  expense: "💸",
  member: "👋",
  booking: "📅",
  vote: "🗳️",
  review: "⭐",
  finalize: "✅",
  system: "💡",
};

export default function Notifications() {
  const { data: notifications = [], isLoading, error } = useNotifications();
  const { data: trips = [] } = useTrips();
  const markAllRead = useMarkAllNotificationsAsRead();
  const joinFromNotification = useJoinTripFromNotification();
  const tripPreview = useNotificationTripPreview();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeFilter, setActiveFilter] = useState<"all" | "member" | "expense" | "vote" | "system">("all");
  const [joiningNotificationId, setJoiningNotificationId] = useState<string | null>(null);
  const [actionStates, setActionStates] = useState<Record<string, string>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<NotificationTripPreview | null>(null);
  const [receiptModal, setReceiptModal] = useState<{ open: boolean; title: string; amount: number; by: string } | null>(null);

  const joinedTripIds = useMemo(() => new Set(trips.map((trip) => trip.id)), [trips]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast({ title: "All notifications marked as read" });
    } catch {
      toast({ title: "Failed to mark all as read", variant: "destructive" });
    }
  };

  const handleJoinFromNotification = async (notificationId: string) => {
    try {
      setJoiningNotificationId(notificationId);
      const result = await joinFromNotification.mutateAsync(notificationId);
      setActionStates((prev) => ({ ...prev, [notificationId]: "joined" }));
      toast({ title: result.alreadyMember ? "You are already in this trip" : "Trip joined successfully! 🎒" });
      if (result.tripId) {
        navigate(`/trips/${result.tripId}`);
      }
    } catch (error: any) {
      toast({
        title: "Could not join trip",
        description: error?.message || "This invite may have expired or is no longer valid.",
        variant: "destructive",
      });
    } finally {
      setJoiningNotificationId(null);
    }
  };

  const handleDeclineInvite = (notificationId: string) => {
    setActionStates((prev) => ({ ...prev, [notificationId]: "declined" }));
    toast({ title: "Invite declined", description: "You have politely declined the invitation." });
  };

  const handleApproveExpense = (notificationId: string) => {
    setActionStates((prev) => ({ ...prev, [notificationId]: "approved_expense" }));
    toast({
      title: "Expense Approved! ✅",
      description: "Your portion of this expense has been verified and added to your balance.",
    });
  };

  const handleVoteAction = (notificationId: string, type: "up" | "down") => {
    setActionStates((prev) => ({ ...prev, [notificationId]: type === "up" ? "voted_up" : "voted_down" }));
    toast({
      title: type === "up" ? "Vote Recorded: Thumbs Up 👍" : "Vote Recorded: Thumbs Down 👎",
      description: "Your squad vote has been counted in real time.",
    });
  };

  const handleViewTripDetails = async (notificationId: string) => {
    try {
      const result = await tripPreview.mutateAsync(notificationId);
      setSelectedPreview(result);
      setIsPreviewOpen(true);
    } catch (error: any) {
      toast({
        title: "Could not load trip details",
        description: error?.message || "The invite may no longer be available.",
        variant: "destructive",
      });
    }
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "system") {
      return notifications.filter((n) => n.type === "system" || n.type === "booking" || n.type === "finalize");
    }
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      member: notifications.filter((n) => n.type === "member").length,
      expense: notifications.filter((n) => n.type === "expense").length,
      vote: notifications.filter((n) => n.type === "vote").length,
      system: notifications.filter((n) => n.type === "system" || n.type === "booking" || n.type === "finalize").length,
    };
  }, [notifications]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <Skeleton className="mb-6 h-10 w-1/3" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Stay updated with your group invites, expense splits, and trip decisions.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending || error}
            className="self-start sm:self-auto"
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Mark all read
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-4">
          {[
            { id: "all", label: "All", count: counts.all },
            { id: "member", label: "👋 Invites", count: counts.member },
            { id: "expense", label: "💸 Expenses", count: counts.expense },
            { id: "vote", label: "🗳️ Voting", count: counts.vote },
            { id: "system", label: "💡 System", count: counts.system },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    activeFilter === tab.id ? "bg-white/20 text-white" : "bg-border text-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 flex gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">Failed to load notifications. Please try again later.</p>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {error ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
              <p className="mt-2 text-sm font-medium text-foreground">Could not load notifications</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <h4 className="mt-3 font-bold text-foreground">No notifications in this category</h4>
              <p className="text-sm text-muted-foreground mt-1">You are all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const isInviteNotification = n.type === "member" && Boolean(n.tripId);
              const isJoined = (isInviteNotification && Boolean(n.tripId && joinedTripIds.has(n.tripId))) || actionStates[n.id] === "joined";
              const isDeclined = actionStates[n.id] === "declined";
              const isExpense = n.type === "expense";
              const isExpenseApproved = actionStates[n.id] === "approved_expense";
              const isVote = n.type === "vote";
              const voteState = actionStates[n.id];
              const isJoining = joiningNotificationId === n.id;

              return (
                <div
                  key={n.id}
                  className={`group relative rounded-2xl border border-border p-4 transition-all hover:shadow-card ${
                    !n.isRead ? "bg-primary/5 border-primary/20" : "bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-xl">
                      {typeIcons[n.type] || "🔔"}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground leading-snug">{n.message}</p>
                        {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1.5" />}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>

                      {/* Dynamic Inline Action Triggers */}
                      {isInviteNotification && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {isDeclined ? (
                            <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                              Invite Declined
                            </Badge>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant={isJoined ? "secondary" : "default"}
                                className={isJoined ? "cursor-not-allowed opacity-70" : "bg-primary font-semibold"}
                                onClick={() => handleJoinFromNotification(n.id)}
                                disabled={isJoined || isJoining}
                              >
                                {isJoined ? "Joined ✓" : isJoining ? "Joining..." : "Join Trip Now"}
                              </Button>
                              {!isJoined && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeclineInvite(n.id)}
                                  className="text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                >
                                  Decline
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewTripDetails(n.id)}
                                disabled={tripPreview.isPending}
                                className="text-xs text-muted-foreground"
                              >
                                Preview Trip
                              </Button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Inline Expense Actions */}
                      {isExpense && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {isExpenseApproved ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              <Check className="h-3 w-3" /> Share Approved & Settled
                            </span>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveExpense(n.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8"
                              >
                                <Check className="mr-1 h-3.5 w-3.5" /> Approve Share
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setReceiptModal({
                                    open: true,
                                    title: n.message,
                                    amount: 4200,
                                    by: "Trip Organizer",
                                  })
                                }
                                className="text-xs h-8"
                              >
                                <Receipt className="mr-1 h-3.5 w-3.5" /> View Receipt
                              </Button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Inline Vote Actions */}
                      {isVote && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {voteState === "voted_up" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 text-xs">
                              <ThumbsUp className="h-3 w-3" /> Voted Yes
                            </Badge>
                          ) : voteState === "voted_down" ? (
                            <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1 text-xs">
                              <ThumbsDown className="h-3 w-3" /> Voted No
                            </Badge>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVoteAction(n.id, "up")}
                                className="text-xs h-8 hover:border-emerald-500 hover:text-emerald-600 gap-1"
                              >
                                <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" /> Vote Yes
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVoteAction(n.id, "down")}
                                className="text-xs h-8 hover:border-destructive hover:text-destructive gap-1"
                              >
                                <ThumbsDown className="h-3.5 w-3.5 text-rose-500" /> Vote No
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Trip Preview Modal */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle>Trip Invite Details</DialogTitle>
            </DialogHeader>
            {selectedPreview ? (
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                  <p className="font-bold text-foreground text-base">{selectedPreview.trip.title}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {selectedPreview.trip.destination}, {selectedPreview.trip.country}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Dates</p>
                    <p className="font-medium text-foreground">
                      {formatDateRange(selectedPreview.trip.checkIn, selectedPreview.trip.checkOut)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">{selectedPreview.trip.nights} nights</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Squad Size</p>
                    <p className="font-medium text-foreground">
                      {selectedPreview.trip.currentMembers}/{selectedPreview.trip.groupSize} confirmed
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Target Budget</p>
                    <p className="font-medium text-foreground">
                      {formatCurrency(selectedPreview.trip.budgetPerPerson)}/person
                    </p>
                  </div>
                </div>
                {selectedPreview.inviteExpiresAt ? (
                  <p className="text-xs text-muted-foreground">
                    Invite expires: {new Date(selectedPreview.inviteExpiresAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No trip details available.</p>
            )}
          </DialogContent>
        </Dialog>

        {/* Expense Receipt Modal */}
        <Dialog open={Boolean(receiptModal?.open)} onOpenChange={(open) => !open && setReceiptModal(null)}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" /> Verified Expense Receipt
              </DialogTitle>
            </DialogHeader>
            {receiptModal && (
              <div className="space-y-4 text-sm">
                <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Expense Item</span>
                    <span className="font-bold text-foreground">{receiptModal.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total Bill</span>
                    <span className="font-extrabold text-foreground">{formatCurrency(receiptModal.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Paid By</span>
                    <span className="font-semibold text-primary">{receiptModal.by}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Verification</span>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px]">
                      Digital Receipt Attached ✓
                    </Badge>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setReceiptModal(null)}>
                  Close Receipt
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
