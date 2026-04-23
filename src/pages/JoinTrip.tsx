import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJoinTripWithCode } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function JoinTrip() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const joinTrip = useJoinTripWithCode();
  const [status, setStatus] = useState<"joining" | "success" | "error">("joining");
  const [message, setMessage] = useState("Preparing your trip invite...");
  const didStartRef = useRef(false);

  const decodedCode = useMemo(() => {
    if (!code) return "";
    try {
      return decodeURIComponent(code);
    } catch {
      return code;
    }
  }, [code]);

  useEffect(() => {
    if (isLoading || didStartRef.current) {
      return;
    }

    if (!decodedCode) {
      didStartRef.current = true;
      setStatus("error");
      setMessage("Invalid invite link. Please ask the organizer to resend it.");
      return;
    }

    if (!isAuthenticated) {
      didStartRef.current = true;
      navigate("/login", {
        replace: true,
        state: { redirectTo: `/join/${encodeURIComponent(decodedCode)}` },
      });
      return;
    }

    didStartRef.current = true;
    setStatus("joining");
    setMessage("Joining trip...");

    joinTrip.mutate(decodedCode, {
      onSuccess: (trip) => {
        const tripId = trip?.id;
        setStatus("success");
        setMessage("You have joined the trip. Redirecting now...");
        toast({ title: "Joined trip successfully" });
        if (tripId) {
          navigate(`/trips/${tripId}`, { replace: true });
        } else {
          navigate("/dashboard/trips", { replace: true });
        }
      },
      onError: (error: any) => {
        setStatus("error");
        setMessage(error?.message || "Unable to join this trip with the provided invite code.");
        toast({
          title: "Could not join trip",
          description: error?.message || "Please verify the invite code and try again.",
          variant: "destructive",
        });
      },
    });
  }, [decodedCode, isAuthenticated, isLoading, joinTrip, navigate, toast]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          {status === "joining" ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Users className="h-6 w-6 text-primary" />
          )}
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Trip Invitation</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>

        {status === "error" ? (
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={() => navigate("/dashboard/trips")}>Go to My Trips</Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
