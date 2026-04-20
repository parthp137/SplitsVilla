
import { Calendar, Star } from "lucide-react";
import { mockProperties } from "@/utils/mockData";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";

const bookings = [
  { id: "b1", property: mockProperties[0], checkIn: "2025-05-01", checkOut: "2025-05-05", nights: 4, guests: 6, total: 50000, status: "confirmed" as const },
  { id: "b2", property: mockProperties[2], checkIn: "2024-12-20", checkOut: "2024-12-25", nights: 5, guests: 8, total: 40000, status: "completed" as const },
];

const statusStyle: Record<string, string> = { confirmed: "bg-success/10 text-success", completed: "bg-muted text-muted-foreground", cancelled: "bg-destructive/10 text-destructive", pending: "bg-warning/10 text-warning" };

export default function Bookings() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">My Bookings</h1>
        <div className="mt-8 space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row">
              <img src={b.property.images[0]} alt="" className="h-32 w-44 shrink-0 rounded-xl object-cover" loading="lazy" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-heading text-lg font-bold text-foreground">{b.property.title}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[b.status]}`}>{b.status}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{b.property.location.city} · {b.nights} nights · {b.guests} guests</p>
                <p className="mt-1 text-sm text-muted-foreground">{new Date(b.checkIn).toLocaleDateString()} — {new Date(b.checkOut).toLocaleDateString()}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-heading text-lg font-bold text-foreground">{formatCurrency(b.total)}</span>
                  {b.status === "completed" && <Button variant="outline" size="sm"><Star className="mr-1 h-3.5 w-3.5" /> Write Review</Button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
