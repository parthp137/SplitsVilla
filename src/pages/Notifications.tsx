import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useJoinTripFromNotification, useNotificationTripPreview, useNotifications, useMarkAllNotificationsAsRead, useTrips } from "@/hooks/useApi";
import { formatDateRange, timeAgo } from "@/utils/formatDate";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/formatCurrency";

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

const typeIcons: Record<string, string> = { expense: "💸", member: "👋", booking: "📅", vote: "🗳️", review: "⭐", finalize: "✅", system: "💡" };

export default function Notifications() {
  const { data: notifications = [], isLoading, error } = useNotifications();
  const { data: trips = [] } = useTrips();
  const markAllRead = useMarkAllNotificationsAsRead();
  const joinFromNotification = useJoinTripFromNotification();
  const tripPreview = useNotificationTripPreview();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [joiningNotificationId, setJoiningNotificationId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<NotificationTripPreview | null>(null);

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
      toast({ title: result.alreadyMember ? "You are already in this trip" : "Trip joined successfully" });
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
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-extrabold text-foreground">Notifications</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllRead} 
            disabled={markAllRead.isPending || error}
          >
            Mark all read
          </Button>
        </div>

        {error && (
          <div className="mt-6 flex gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">Failed to load notifications. Please try again later.</p>
          </div>
        )}

        <div className="mt-6 space-y-2">
          {error ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
              <p className="mt-2 text-sm font-medium text-foreground">Could not load notifications</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isInviteNotification = n.type === "member" && Boolean(n.tripId);
              const isJoined = isInviteNotification && Boolean(n.tripId && joinedTripIds.has(n.tripId));
              const isJoining = joiningNotificationId === n.id;

              return (
              <div key={n.id} className={`flex items-start gap-3 rounded-xl border border-border p-4 transition-colors ${!n.isRead ? "bg-primary/5" : "bg-card"}`}>
                <span className="mt-0.5 text-xl">{typeIcons[n.type] || "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                  {isInviteNotification ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewTripDetails(n.id)}
                        disabled={tripPreview.isPending}
                      >
                        View details
                      </Button>
                      <Button
                        size="sm"
                        variant={isJoined ? "secondary" : "default"}
                        className={isJoined ? "cursor-not-allowed opacity-60" : ""}
                        onClick={() => handleJoinFromNotification(n.id)}
                        disabled={isJoined || isJoining}
                      >
                        {isJoined ? "Joined" : isJoining ? "Joining..." : "Join now"}
                      </Button>
                    </div>
                  ) : null}
                </div>
                {!n.isRead && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
            );
            })
          )}
        </div>

        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Trip details</DialogTitle>
            </DialogHeader>
            {selectedPreview ? (
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="font-semibold text-foreground">{selectedPreview.trip.title}</p>
                  <p className="text-muted-foreground">{selectedPreview.trip.destination}, {selectedPreview.trip.country}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Dates</p>
                    <p className="font-medium text-foreground">{formatDateRange(selectedPreview.trip.checkIn, selectedPreview.trip.checkOut)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">{selectedPreview.trip.nights} nights</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Members</p>
                    <p className="font-medium text-foreground">{selectedPreview.trip.currentMembers}/{selectedPreview.trip.groupSize}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Budget/person</p>
                    <p className="font-medium text-foreground">{formatCurrency(selectedPreview.trip.budgetPerPerson)}</p>
                  </div>
                </div>
                {selectedPreview.inviteExpiresAt ? (
                  <p className="text-xs text-muted-foreground">Invite expires: {new Date(selectedPreview.inviteExpiresAt).toLocaleString()}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No trip details available.</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
