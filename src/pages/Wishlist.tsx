
import { Heart } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { mockProperties } from "@/utils/mockData";

export default function Wishlist() {
  const saved = mockProperties.filter((p) => ["p1", "p4", "p6"].includes(p.id));
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">Wishlist</h1>
        <p className="mt-1 text-muted-foreground">{saved.length} saved properties</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {saved.map((p) => <PropertyCard key={p.id} property={p} isWishlisted />)}
        </div>
        {saved.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Heart className="h-16 w-16 text-muted" />
            <h3 className="mt-4 font-heading text-xl font-bold text-foreground">Start saving your dream stays</h3>
            <p className="mt-2 text-muted-foreground">Tap the heart on any property to save it here</p>
          </div>
        )}
      </div>
    </div>
  );
}
