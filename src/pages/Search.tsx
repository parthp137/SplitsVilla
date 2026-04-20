import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, MapPin, Sliders, X } from "lucide-react";
import { motion } from "framer-motion";

import PropertyCard from "@/components/property/PropertyCard";
import MapView from "@/components/MapView";
import { useSearchProperties } from "@/hooks/useApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockProperties } from "@/utils/mockData";
import type { Property } from "@/types";
import { SearchResultsSkeleton } from "@/components/SkeletonLoaders";
import {
  AmbientBackgroundMotion,
  StaggeredListAnimation,
  BlurReveal,
  PageTransitionWrapper,
} from "@/components/effects/AdvancedAnimations";
import { readWishlistIds, toggleWishlistId } from "@/lib/wishlist";

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

const sortOptions = ["Recommended", "Price: Low to High", "Price: High to Low", "Rating"];
const propertyTypes = ["All", "Villa", "Apartment", "Hotel", "Hostel", "Resort", "Cottage"];
const quickAmenityOptions = ["WiFi", "Kitchen", "Pool", "Parking", "AC", "Gym"];
const PRICE_MIN = 0;
const PRICE_MAX = 50000;
const RATING_MIN = 0;
const RATING_MAX = 5;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState(parseInt(searchParams.get("sort") || "0"));
  const [activeType, setActiveType] = useState(searchParams.get("type") || "All");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
  const [priceMin, setPriceMin] = useState(parseInt(searchParams.get("priceMin") || "0"));
  const [priceMax, setPriceMax] = useState(parseInt(searchParams.get("priceMax") || String(PRICE_MAX)));
  const [minRating, setMinRating] = useState(parseFloat(searchParams.get("ratingMin") || searchParams.get("rating") || "0"));
  const [maxRating, setMaxRating] = useState(parseFloat(searchParams.get("ratingMax") || String(RATING_MAX)));
  const [selectedAmenities, setSelectedAmenities] = useState(
    searchParams.get("amenities")?.split(",").filter(Boolean) || []
  );
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const categoryParam = searchParams.get("category");
  const shouldFocusSearch = searchParams.get("focus") === "1";

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

  useEffect(() => {
    if (categoryParam) {
      const categoryMap: { [key: string]: string } = {
        villas: "Villa",
        beach: "Hotel",
        mountains: "Cottage",
        city: "Apartment",
        pools: "Resort",
        luxury: "All",
        budget: "Hostel",
      };
      const mappedType = categoryMap[categoryParam];
      if (mappedType) setActiveType(mappedType);
    }
  }, [categoryParam]);

  useEffect(() => {
    if (shouldFocusSearch) {
      searchInputRef.current?.focus();
    }
  }, [shouldFocusSearch]);

  // Update URL params on filter change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (activeType !== "All") params.set("type", activeType);
    if (sortBy !== 0) params.set("sort", sortBy.toString());
    if (priceMin > 0) params.set("priceMin", priceMin.toString());
    if (priceMax < PRICE_MAX) params.set("priceMax", priceMax.toString());
    if (minRating > 0) params.set("ratingMin", minRating.toString());
    if (maxRating < RATING_MAX) params.set("ratingMax", maxRating.toString());
    if (selectedAmenities.length > 0) params.set("amenities", selectedAmenities.join(","));
    setSearchParams(params);
  }, [
    query,
    activeType,
    sortBy,
    priceMin,
    priceMax,
    minRating,
    maxRating,
    selectedAmenities,
    setSearchParams,
  ]);

  const { data: apiProperties = [], isLoading } = useSearchProperties(
    query || activeType !== "All"
      ? { city: query, type: activeType !== "All" ? activeType.toLowerCase() : undefined }
      : undefined
  );

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

  const properties = useMemo(() => {
    const baseProperties = apiProperties.length > 0 ? apiProperties : mockProperties;
    const baseIds = new Set(baseProperties.map((property) => property.id));
    const uniqueHosted = hostedProperties.filter((property) => !baseIds.has(property.id));
    return [...uniqueHosted, ...baseProperties];
  }, [apiProperties, hostedProperties]);

  const filtered = properties
    .filter((p) => {
      const matchesQuery =
        !query ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.location.city.toLowerCase().includes(query.toLowerCase());
      const matchesType = activeType === "All" || p.type.toLowerCase() === activeType.toLowerCase();
      const matchesPrice = p.pricePerNight >= priceMin && p.pricePerNight <= priceMax;
      const matchesRating = p.rating >= minRating && p.rating <= maxRating;
      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((amenity) => p.amenities.includes(amenity));
      return matchesQuery && matchesType && matchesPrice && matchesRating && matchesAmenities;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 1:
          return a.pricePerNight - b.pricePerNight;
        case 2:
          return b.pricePerNight - a.pricePerNight;
        case 3:
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const hasActiveFilters =
    activeType !== "All" ||
    selectedAmenities.length > 0 ||
    priceMin > 0 ||
    priceMax < PRICE_MAX ||
    minRating > 0 ||
    maxRating < RATING_MAX;

  const handleWishlistToggle = (propertyId: string) => {
    const result = toggleWishlistId(propertyId);
    setWishlistIds(result.wishlistIds);
  };

  return (
    <PageTransitionWrapper>
      <div className="relative min-h-screen overflow-hidden bg-background">
        <div className="fixed inset-0 -z-10">
          <AmbientBackgroundMotion />
          <motion.div
            className="absolute inset-0 opacity-15"
            animate={{
              background: [
                "radial-gradient(ellipse at 0% 0%, rgba(249, 115, 22, 0.12) 0%, transparent 50%)",
                "radial-gradient(ellipse at 100% 100%, rgba(250, 204, 21, 0.12) 0%, transparent 50%)",
                "radial-gradient(ellipse at 0% 0%, rgba(249, 115, 22, 0.12) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 15, repeat: Infinity }}
          />
        </div>

        <motion.div
          className="relative mx-auto max-w-7xl px-4 py-6 lg:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <BlurReveal>
            <h1 className="font-heading text-4xl font-black">Find Your Perfect Stay</h1>
          </BlurReveal>

          <motion.div
            className="mt-4 flex gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 p-4 backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon className="h-5 w-5 text-primary" />
              </div>
              <Input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city or property..."
                className="border-0 bg-transparent pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              {showFilters ? <X className="h-4 w-4" /> : <Sliders className="h-4 w-4" />}
            </Button>
          </motion.div>

          <motion.div
            className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex gap-3 overflow-x-auto py-1">
              {sortOptions.map((s, i) => (
                <motion.button
                  key={s}
                  onClick={() => setSortBy(i)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    i === sortBy
                      ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                      : "bg-card text-muted-foreground hover:bg-accent"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Button
                variant="outline"
                onClick={() => setShowFilters((prev) => !prev)}
                className="gap-2"
              >
                <Sliders className="h-4 w-4" />
                Filters
                {hasActiveFilters && !showFilters ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    Applied
                  </span>
                ) : null}
                {showFilters ? <X className="h-4 w-4" /> : null}
              </Button>
              {hasActiveFilters ? (
                <span className="text-xs text-muted-foreground">{filtered.length} properties</span>
              ) : null}
            </div>
          </motion.div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              className="mt-6 rounded-2xl border border-primary/20 bg-card p-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Type of place</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {propertyTypes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveType(t)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          t === activeType
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-background text-foreground hover:bg-accent"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Amenities</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quickAmenityOptions.map((amenity) => {
                      const isActive = selectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          onClick={() =>
                            setSelectedAmenities((prev) =>
                              prev.includes(amenity)
                                ? prev.filter((item) => item !== amenity)
                                : [...prev, amenity]
                            )
                          }
                          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "border border-border bg-background text-foreground hover:bg-accent"
                          }`}
                        >
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Price range: Rs {priceMin.toLocaleString()} - Rs {priceMax.toLocaleString()}
                  </label>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Minimum price</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-foreground">Rs {priceMin.toLocaleString()}</span>
                    </div>
                    <Input
                      type="range"
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      step="500"
                      value={priceMin}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setPriceMin(Math.min(value, priceMax));
                      }}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Maximum price</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-foreground">Rs {priceMax.toLocaleString()}</span>
                    </div>
                    <Input
                      type="range"
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      step="500"
                      value={priceMax}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setPriceMax(Math.max(value, priceMin));
                      }}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Rating range: {minRating.toFixed(1)} - {maxRating.toFixed(1)}
                  </label>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Minimum rating</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-foreground">{minRating.toFixed(1)}★</span>
                    </div>
                    <Input
                      type="range"
                      min={RATING_MIN}
                      max={RATING_MAX}
                      step="0.5"
                      value={minRating}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setMinRating(Math.min(value, maxRating));
                      }}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Maximum rating</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-foreground">{maxRating.toFixed(1)}★</span>
                    </div>
                    <Input
                      type="range"
                      min={RATING_MIN}
                      max={RATING_MAX}
                      step="0.5"
                      value={maxRating}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setMaxRating(Math.max(value, minRating));
                      }}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPriceMin(0);
                      setPriceMax(PRICE_MAX);
                      setMinRating(0);
                      setMaxRating(RATING_MAX);
                      setActiveType("All");
                      setSelectedAmenities([]);
                    }}
                    className="w-full"
                  >
                    Reset Filters
                  </Button>
                  <Button
                    onClick={() => setShowFilters(false)}
                    className="w-full"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            className="mt-6 grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div className="hidden overflow-hidden rounded-3xl border border-primary/20 lg:sticky lg:top-24 lg:block lg:h-[calc(100vh-7rem)]">
              <MapView properties={filtered} selectedId={selectedPropertyId} onPropertyClick={setSelectedPropertyId} />
            </motion.div>

            <div className="lg:h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
              {isLoading ? (
                <SearchResultsSkeleton />
              ) : filtered.length > 0 ? (
                <StaggeredListAnimation>
                  <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((p) => (
                      <motion.div
                        key={p.id}
                        onClick={() => setSelectedPropertyId(p.id)}
                        className={selectedPropertyId === p.id ? "ring-2 ring-primary" : ""}
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        <PropertyCard
                          property={p}
                          groupSize={4}
                          showPerPerson
                          isWishlisted={wishlistIds.includes(p.id)}
                          onWishlistToggle={handleWishlistToggle}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </StaggeredListAnimation>
              ) : (
                <motion.div
                  className="flex flex-col items-center rounded-3xl border border-primary/20 bg-primary/5 py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <MapPin className="h-16 w-16 text-primary/40" />
                  <h3 className="mt-4 font-heading text-2xl font-bold">No properties found</h3>
                  <p className="mt-2 text-muted-foreground">Try adjusting your search or filters</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransitionWrapper>
  );
}
