import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, MapPin, Sliders, X } from "lucide-react";
import { motion } from "framer-motion";

import PropertyCard from "@/components/property/PropertyCard";
import MapView from "@/components/MapView";
import { useSearchProperties } from "@/hooks/useApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockProperties } from "@/utils/mockData";
import { SearchResultsSkeleton } from "@/components/SkeletonLoaders";
import {
  AmbientBackgroundMotion,
  StaggeredListAnimation,
  BlurReveal,
  PageTransitionWrapper,
} from "@/components/effects/AdvancedAnimations";

const sortOptions = ["Recommended", "Price: Low to High", "Price: High to Low", "Rating"];
const propertyTypes = ["All", "Villa", "Apartment", "Hotel", "Hostel", "Resort", "Cottage"];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState(parseInt(searchParams.get("sort") || "0"));
  const [activeType, setActiveType] = useState(searchParams.get("type") || "All");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
  const [priceMin, setPriceMin] = useState(parseInt(searchParams.get("priceMin") || "0"));
  const [priceMax, setPriceMax] = useState(parseInt(searchParams.get("priceMax") || "50000"));
  const [minRating, setMinRating] = useState(parseInt(searchParams.get("rating") || "0"));
  const [showFilters, setShowFilters] = useState(false);
  const categoryParam = searchParams.get("category");

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

  // Update URL params on filter change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (activeType !== "All") params.set("type", activeType);
    if (sortBy !== 0) params.set("sort", sortBy.toString());
    if (priceMin > 0) params.set("priceMin", priceMin.toString());
    if (priceMax < 50000) params.set("priceMax", priceMax.toString());
    if (minRating > 0) params.set("rating", minRating.toString());
    setSearchParams(params);
  }, [query, activeType, sortBy, priceMin, priceMax, minRating, setSearchParams]);

  const { data: apiProperties = [], isLoading } = useSearchProperties(
    query || activeType !== "All"
      ? { city: query, type: activeType !== "All" ? activeType.toLowerCase() : undefined }
      : undefined
  );

  const properties = apiProperties.length > 0 ? apiProperties : mockProperties;

  const filtered = properties
    .filter((p) => {
      const matchesQuery =
        !query ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.location.city.toLowerCase().includes(query.toLowerCase());
      const matchesType = activeType === "All" || p.type.toLowerCase() === activeType.toLowerCase();
      const matchesPrice = p.pricePerNight >= priceMin && p.pricePerNight <= priceMax;
      const matchesRating = p.rating >= minRating;
      return matchesQuery && matchesType && matchesPrice && matchesRating;
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
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              >
                <SearchIcon className="h-5 w-5 text-primary" />
              </motion.div>
              <Input
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
            className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {propertyTypes.map((t) => (
              <motion.button
                key={t}
                onClick={() => setActiveType(t)}
                className={`shrink-0 rounded-full px-4 py-2 font-medium ${
                  t === activeType
                    ? "bg-primary/30 text-card ring-2 ring-primary/50"
                    : "border border-primary/20 bg-primary/10"
                }`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                {t}
              </motion.button>
            ))}
          </motion.div>

          <motion.div className="mt-4 flex gap-4">
            <p className="text-sm font-semibold text-primary">{filtered.length} properties</p>
            <div className="flex gap-2 overflow-x-auto">
              {sortOptions.map((s, i) => (
                <motion.button
                  key={s}
                  onClick={() => setSortBy(i)}
                  className={`text-sm font-medium ${i === sortBy ? "text-primary underline" : "text-muted-foreground"}`}
                  whileHover={{ scale: 1.05 }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Advanced Filters */}
          {(showFilters || window.innerWidth >= 1024) && (
            <motion.div
              className="mt-6 rounded-2xl border border-primary/20 bg-card p-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Price Range: ₹{priceMin.toLocaleString()} - ₹{priceMax.toLocaleString()}
                  </label>
                  <div className="mt-2 space-y-2">
                    <Input
                      type="range"
                      min="0"
                      max="50000"
                      step="1000"
                      value={priceMin}
                      onChange={(e) => setPriceMin(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <Input
                      type="range"
                      min="0"
                      max="50000"
                      step="1000"
                      value={priceMax}
                      onChange={(e) => setPriceMax(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Minimum Rating: {minRating > 0 ? `${minRating.toFixed(1)}★` : "All"}
                  </label>
                  <div className="mt-2">
                    <Input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={minRating}
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPriceMin(0);
                      setPriceMax(50000);
                      setMinRating(0);
                    }}
                    className="w-full"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            className="mt-6 flex gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div className="hidden w-[400px] shrink-0 overflow-hidden rounded-3xl border border-primary/20 lg:block">
              <MapView properties={filtered} selectedId={selectedPropertyId} onPropertyClick={setSelectedPropertyId} />
            </motion.div>

            <div className="flex-1">
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
                        <PropertyCard property={p} groupSize={4} showPerPerson />
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
