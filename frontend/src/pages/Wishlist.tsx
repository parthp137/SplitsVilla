import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Plus,
  Share2,
  Sparkles,
  FolderPlus,
  Compass,
  Copy,
  Check,
  Palmtree,
  Mountain,
  Users,
} from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { useSearchProperties } from "@/hooks/useApi";
import { mockProperties } from "@/utils/mockData";
import { readWishlistIds, toggleWishlistId } from "@/lib/wishlist";
import type { Property } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const HOST_LISTINGS_KEY = "sv_host_listings";
const BOARDS_KEY = "sv_wishlist_boards";
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

interface MoodBoard {
  id: string;
  title: string;
  emoji: string;
  description?: string;
  propertyIds?: string[];
}

const DEFAULT_BOARDS: MoodBoard[] = [
  { id: "all", title: "All Saved Stays", emoji: "⭐", description: "All properties saved across your explorations" },
  { id: "beach", title: "Goa Beach Villas", emoji: "🏖️", description: "Top seaside stays with pool for group weekend" },
  { id: "mountains", title: "Himalayan Getaways", emoji: "🏔️", description: "Cozy mountain cottages and scenic retreats" },
];

function getFallbackCoordinates(seed: string) {
  const hash = Array.from(seed || "host").reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);
  const lat = 20.5937 + ((hash % 300) - 150) * 0.01;
  const lng = 78.9629 + ((hash % 500) - 250) * 0.01;
  return { lat, lng };
}

export default function Wishlist() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: apiProperties = [] } = useSearchProperties();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [boards, setBoards] = useState<MoodBoard[]>(DEFAULT_BOARDS);
  const [activeBoardId, setActiveBoardId] = useState<string>("all");
  const [openCreateBoard, setOpenCreateBoard] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardEmoji, setNewBoardEmoji] = useState("✨");

  useEffect(() => {
    setWishlistIds(readWishlistIds());

    try {
      const savedBoards = JSON.parse(localStorage.getItem(BOARDS_KEY) || "null");
      if (Array.isArray(savedBoards) && savedBoards.length > 0) {
        setBoards(savedBoards);
      }
    } catch {
      setBoards(DEFAULT_BOARDS);
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === "sv_wishlist_ids") {
        setWishlistIds(readWishlistIds());
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const saveBoards = (nextBoards: MoodBoard[]) => {
    setBoards(nextBoards);
    localStorage.setItem(BOARDS_KEY, JSON.stringify(nextBoards));
  };

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

  const allSavedProperties = useMemo(
    () => wishlistIds.map((id) => propertyById.get(id)).filter((property): property is Property => Boolean(property)),
    [propertyById, wishlistIds],
  );

  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

  // Filter properties based on active board
  const displayedProperties = useMemo(() => {
    if (activeBoard.id === "all") return allSavedProperties;
    if (activeBoard.id === "beach") {
      return allSavedProperties.filter(
        (p) => p.location.city.toLowerCase().includes("goa") || p.type === "villa" || p.type === "resort"
      );
    }
    if (activeBoard.id === "mountains") {
      return allSavedProperties.filter(
        (p) => p.location.city.toLowerCase().includes("manali") || p.type === "cottage" || p.type === "hotel"
      );
    }
    if (activeBoard.propertyIds) {
      return activeBoard.propertyIds
        .map((id) => propertyById.get(id))
        .filter((p): p is Property => Boolean(p));
    }
    return allSavedProperties;
  }, [activeBoard, allSavedProperties, propertyById]);

  const handleWishlistToggle = (propertyId: string) => {
    const result = toggleWishlistId(propertyId);
    setWishlistIds(result.wishlistIds);
  };

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    const newBoard: MoodBoard = {
      id: `board-${Date.now()}`,
      title: newBoardTitle.trim(),
      emoji: newBoardEmoji || "✨",
      description: "Custom collaborative wishlist moodboard",
      propertyIds: wishlistIds.slice(0, 3),
    };

    const updated = [...boards, newBoard];
    saveBoards(updated);
    setActiveBoardId(newBoard.id);
    setNewBoardTitle("");
    setOpenCreateBoard(false);
    toast({ title: "Moodboard created! 🎉", description: `Added "${newBoard.title}" to your trip boards.` });
  };

  const handleShareBoard = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "Board link copied!", description: "Anyone with this link can view these shortlisted stays." });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConvertToTrip = () => {
    const sampleStay = displayedProperties[0];
    const destination = sampleStay?.location?.city || "Goa";
    navigate(`/dashboard/trips/create?destination=${encodeURIComponent(destination)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Heart className="h-5 w-5 fill-primary" />
              </span>
              <h1 className="font-heading text-3xl font-extrabold text-foreground">
                Trip Moodboards & Wishlist
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Organize, share, and vote on dream stay candidates with your travel crew
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-border/80 shadow-sm"
              onClick={() => setOpenShareModal(true)}
            >
              <Share2 className="h-3.5 w-3.5" /> Share Board
            </Button>

            {displayedProperties.length > 0 && (
              <Button
                size="sm"
                className="gap-2 bg-gradient-to-r from-primary to-violet-600 shadow-sm"
                onClick={handleConvertToTrip}
              >
                <Sparkles className="h-3.5 w-3.5" /> Convert to Trip
              </Button>
            )}
          </div>
        </div>

        {/* Board Tabs Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border/60">
          {boards.map((board) => {
            const isSelected = board.id === activeBoardId;
            return (
              <button
                key={board.id}
                onClick={() => setActiveBoardId(board.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{board.emoji}</span>
                <span>{board.title}</span>
              </button>
            );
          })}

          <Dialog open={openCreateBoard} onOpenChange={setOpenCreateBoard}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 rounded-full text-xs gap-1 border border-dashed border-border/80">
                <Plus className="h-3.5 w-3.5" /> New Board
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">Create a Trip Moodboard</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateBoard} className="space-y-4 pt-2">
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-xs font-semibold text-foreground">Emoji</label>
                    <Input
                      value={newBoardEmoji}
                      onChange={(e) => setNewBoardEmoji(e.target.value)}
                      maxLength={2}
                      className="text-center text-lg"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-3">
                    <label className="text-xs font-semibold text-foreground">Board Name</label>
                    <Input
                      placeholder="e.g. Manali Workation Cabins"
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Create Moodboard
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Board Meta Banner */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{activeBoard.description || "Shortlisted properties in this board"}</span>
          <span className="font-semibold text-foreground">{displayedProperties.length} Stays</span>
        </div>

        {/* Properties Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedProperties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              isWishlisted
              showPerPerson
              groupSize={4}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>

        {/* Empty State */}
        {displayedProperties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Heart className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-heading text-lg font-bold text-foreground">
                No stays saved in this board yet
              </h3>
              <p className="text-xs text-muted-foreground">
                Tap the heart on any property in Search or Property Details to add it to your moodboards.
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link to="/search">
                <Compass className="h-4 w-4" /> Explore Properties
              </Link>
            </Button>
          </div>
        )}

        {/* Share Board Dialog */}
        <Dialog open={openShareModal} onOpenChange={setOpenShareModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Share Moodboard with Friends</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground">
                Invite your travel crew to check out the stays saved in "{activeBoard.title}".
              </p>

              <div className="flex items-center gap-2 rounded-xl border border-border p-2 bg-muted/40">
                <input
                  readOnly
                  value={window.location.href}
                  className="flex-1 bg-transparent text-xs text-foreground outline-none px-2 font-mono truncate"
                />
                <Button size="sm" onClick={handleShareBoard} className="gap-1.5 shrink-0">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy Link"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
