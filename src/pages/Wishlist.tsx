import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { useSearchProperties } from "@/hooks/useApi";
import { mockProperties } from "@/utils/mockData";
import { readWishlistIds, toggleWishlistId } from "@/lib/wishlist";
import type { Property } from "@/types";

const HOST_LISTINGS_KEY = "sv_host_listings";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200";

type HostLocalListing = {
  id: string;
  title: string;
  type: string;
  address: string;
  city: string;
  country: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  description: string;
  amenities: string[];
  createdAt: string;
};

function getFallbackCoordinates(seed: string) {
  const hash = Array.from(seed || "host").reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);
  const lat = 20.5937 + ((hash % 300) - 150) * 0.01;
  const lng = 78.9629 + ((hash % 500) - 250) * 0.01;
  return { lat, lng };
}

export default function Wishlist() {
  const { data: apiProperties = [] } = useSearchProperties();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    setWishlistIds(readWishlistIds());

    const onStorage = (event: StorageEvent) => {
      if (event.key === "sv_wishlist_ids") {
        setWishlistIds(readWishlistIds());
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const hostedProperties = useMemo<Property[]>(() => {
    try {
      const raw = window.localStorage.getItem(HOST_LISTINGS_KEY);
      const parsed = raw ? (JSON.parse(raw) as HostLocalListing[]) : [];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [];
      }

      return parsed
        .filter((listing) => Boolean(listing?.id && listing?.title))
        .map((listing) => {
          const coords = getFallbackCoordinates(`${listing.city}-${listing.id}`);
          return {
            id: listing.id,
            hostId: "host-local",
            hostName: "You",
            title: listing.title,
            description: listing.description || "Hosted listing",
            type: (listing.type?.toLowerCase() || "villa") as Property["type"],
            location: {
              address: listing.address || "Address pending",
              city: listing.city || "City pending",
              country: listing.country || "India",
              lat: coords.lat,
              lng: coords.lng,
            },
            images: listing.images?.length ? listing.images : [FALLBACK_IMAGE],
            pricePerNight: Number(listing.pricePerNight || 0),
            maxGuests: Number(listing.maxGuests || 1),
            bedrooms: Number(listing.bedrooms || 1),
            bathrooms: Number(listing.bathrooms || 1),
            beds: Math.max(1, Number(listing.bedrooms || 1)),
            amenities: listing.amenities?.length ? listing.amenities : ["WiFi"],
            rules: {
              checkInTime: "14:00",
              checkOutTime: "11:00",
              smokingAllowed: false,
              petsAllowed: true,
              partiesAllowed: false,
            },
            rating: 4.7,
            reviewCount: 0,
            isFeatured: false,
            isActive: true,
            createdAt: listing.createdAt || new Date().toISOString(),
          };
        });
    } catch {
      return [];
    }
  }, []);

  const propertyById = useMemo(() => {
    const map = new Map<string, Property>();
    [...hostedProperties, ...apiProperties, ...mockProperties].forEach((property) => {
      if (!map.has(property.id)) {
        map.set(property.id, property);
      }
    });
    return map;
  }, [apiProperties, hostedProperties]);

  const saved = useMemo(
    () => wishlistIds.map((id) => propertyById.get(id)).filter((property): property is Property => Boolean(property)),
    [propertyById, wishlistIds],
  );

  const handleWishlistToggle = (propertyId: string) => {
    const result = toggleWishlistId(propertyId);
    setWishlistIds(result.wishlistIds);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">Wishlist</h1>
        <p className="mt-1 text-muted-foreground">{saved.length} saved properties</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {saved.map((p) => (
            <PropertyCard key={p.id} property={p} isWishlisted onWishlistToggle={handleWishlistToggle} />
          ))}
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
