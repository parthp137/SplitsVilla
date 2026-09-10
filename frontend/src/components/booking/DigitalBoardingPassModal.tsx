import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Share2,
  Users,
  Download,
  Phone,
  Compass,
  CheckCircle2,
  Ticket,
  Printer,
} from "lucide-react";
import { Booking, Property } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { useToast } from "@/hooks/use-toast";

interface DigitalBoardingPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  property?: Property;
}

export function DigitalBoardingPassModal({
  isOpen,
  onClose,
  booking,
  property,
}: DigitalBoardingPassModalProps) {
  const { toast } = useToast();
  if (!booking) return null;

  const prop = property || booking.property;
  const propTitle = prop?.title || "SplitsVilla Premium Stay";
  const propCity = prop?.location?.city || "Destination";
  const propAddress = prop?.location?.address || `${propCity}, India`;
  const hostName = prop?.hostName || "Verified Host";

  const handleOpenMaps = () => {
    const query = encodeURIComponent(`${propTitle}, ${propAddress}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `🎟️ SplitsVilla Check-in Pass for "${propTitle}"
📍 Address: ${propAddress}
📅 Check-in: ${formatDate(booking.checkIn)} (from 2:00 PM)
📅 Check-out: ${formatDate(booking.checkOut)} (until 11:00 AM)
👥 Guests: ${booking.guests}
Reservation ID: ${booking.id}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Voucher details copied!", description: "Share this pass with your travel group." });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-border/80 bg-background/95 backdrop-blur-xl">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-primary to-violet-600 p-5 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              <span className="font-heading font-black tracking-wider text-sm uppercase">
                Digital Boarding Pass
              </span>
            </div>
            <Badge className="bg-white/20 text-white border-0 text-[10px] font-bold uppercase">
              {booking.status}
            </Badge>
          </div>
          <h3 className="font-heading font-extrabold text-xl mt-3 line-clamp-1">{propTitle}</h3>
          <p className="text-xs text-primary-foreground/80 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" /> {propCity}
          </p>
        </div>

        {/* Perforated Notch Divider */}
        <div className="relative flex items-center justify-between px-2 bg-card -my-2 z-10">
          <div className="h-4 w-4 rounded-full bg-background border-r border-border -ml-4" />
          <div className="h-px flex-1 border-t-2 border-dashed border-border/60 mx-2" />
          <div className="h-4 w-4 rounded-full bg-background border-l border-border -mr-4" />
        </div>

        {/* Pass Details Body */}
        <div className="p-6 space-y-5 bg-card/60">
          {/* Dates & Times */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/40 p-3.5 border border-border/60 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Check-In</span>
              <span className="font-bold text-foreground text-sm block mt-0.5">{formatDate(booking.checkIn)}</span>
              <span className="text-muted-foreground flex items-center gap-1 mt-0.5 text-[11px]">
                <Clock className="h-3 w-3 text-primary" /> From 2:00 PM
              </span>
            </div>
            <div className="border-l border-border/50 pl-3">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Check-Out</span>
              <span className="font-bold text-foreground text-sm block mt-0.5">{formatDate(booking.checkOut)}</span>
              <span className="text-muted-foreground flex items-center gap-1 mt-0.5 text-[11px]">
                <Clock className="h-3 w-3 text-primary" /> Until 11:00 AM
              </span>
            </div>
          </div>

          {/* Guest & Host Info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground block">Guests</span>
              <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                <Users className="h-3.5 w-3.5 text-primary" /> {booking.guests} People
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Host</span>
              <span className="font-semibold text-foreground mt-0.5 block">{hostName}</span>
            </div>
          </div>

          {/* QR Code & Pass ID */}
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">
                Pass Reference
              </span>
              <span className="font-mono font-bold text-xs text-foreground block">
                {booking.id.toUpperCase().slice(0, 14)}
              </span>
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Confirmed & Verified
              </span>
            </div>

            {/* Generated styled QR graphic */}
            <div className="h-16 w-16 rounded-xl border border-border bg-white p-1.5 flex items-center justify-center shadow-sm shrink-0">
              <QrCode className="h-full w-full text-slate-900" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 border-border/80"
              onClick={handleOpenMaps}
            >
              <Compass className="h-3.5 w-3.5 text-primary" /> Open in Maps
            </Button>
            <Button
              size="sm"
              className="text-xs gap-1.5 bg-gradient-to-r from-primary to-violet-600"
              onClick={handleShare}
            >
              <Share2 className="h-3.5 w-3.5" /> Share Pass
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DigitalBoardingPassModal;
