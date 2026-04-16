import { useState } from "react";

import { useNotifications, useMarkAllNotificationsAsRead } from "@/hooks/useApi";
import { timeAgo } from "@/utils/formatDate";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

const typeIcons: Record<string, string> = { expense: "💸", member: "👋", booking: "📅", vote: "🗳️", review: "⭐", finalize: "✅", system: "💡" };

export default function Notifications() {
  const { data: notifications = [], isLoading, error } = useNotifications();
  const markAllRead = useMarkAllNotificationsAsRead();
  const { toast } = useToast();

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast({ title: "All notifications marked as read" });
    } catch {
      toast({ title: "Failed to mark all as read", variant: "destructive" });
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
            notifications.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 rounded-xl border border-border p-4 transition-colors ${!n.isRead ? "bg-primary/5" : "bg-card"}`}>
                <span className="mt-0.5 text-xl">{typeIcons[n.type] || "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
