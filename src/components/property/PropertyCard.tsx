import { useState } from "react";
import { Heart, Star, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Property } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";

interface PropertyCardProps {
  property: Property;
  groupSize?: number;
  showPerPerson?: boolean;
  onWishlistToggle?: (id: string) => void;
  isWishlisted?: boolean;
}

export default function PropertyCard({ property, groupSize, showPerPerson, onWishlistToggle, isWishlisted = false }: PropertyCardProps) {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(isWishlisted);

  const perPerson = groupSize && groupSize > 1 ? Math.round(property.pricePerNight / groupSize) : null;

  return (
    <div className="group cursor-pointer" onClick={() => navigate(`/properties/${property.id}`)}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
        <img
          src={property.images[currentImage]}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); onWishlistToggle?.(property.id); }}
          className="absolute right-3 top-3 z-10"
        >
          <Heart className={`h-6 w-6 drop-shadow-md transition-colors ${wishlisted ? "fill-primary text-primary" : "fill-foreground/30 text-card"}`} />
        </button>
        {/* Image nav */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentImage((p) => (p === 0 ? property.images.length - 1 : p - 1)); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentImage((p) => (p === property.images.length - 1 ? 0 : p + 1)); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </>
        )}
        {/* Dots */}
        {property.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {property.images.map((_, i) => (
              <div key={i} className={`h-1.5 w-1.5 rounded-full transition-colors ${i === currentImage ? "bg-card" : "bg-card/50"}`} />
            ))}
          </div>
        )}
        {/* Group deal badge */}
        {showPerPerson && perPerson && property.maxGuests >= 4 && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1">
            <Users className="h-3 w-3 text-primary-foreground" />
            <span className="text-xs font-semibold text-primary-foreground">Group Deal</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between">
          <h3 className="font-heading text-[15px] font-semibold text-foreground line-clamp-1">{property.title}</h3>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
            <span className="text-sm font-medium text-foreground">{property.rating}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{property.location.city}, {property.location.country}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading text-[15px] font-bold text-foreground">{formatCurrency(property.pricePerNight)}</span>
          <span className="text-sm text-muted-foreground">night</span>
          {showPerPerson && perPerson && (
            <span className="ml-auto text-sm font-semibold text-primary">{formatCurrency(perPerson)}/person</span>
          )}
        </div>
      </div>
    </div>
  );
}
