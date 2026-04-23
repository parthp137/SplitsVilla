import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import { BarChart3, Home, Star, Calendar, Plus, Pencil, Archive, RotateCcw, UploadCloud, BedDouble, Bath, Users, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { BecomeHostFormData } from "@/lib/validationSchemas";
import { useArchiveProperty, useCreateProperty, useHostProperties, useHostStats, useRestoreProperty, useUpdateProperty } from "@/hooks/useApi";
import type { Property } from "@/types";

const HOST_DRAFT_KEY = "sv_host_draft";

function parseImageEntries(rawValue?: string) {
  if (!rawValue?.trim()) {
    return [] as string[];
  }

  if (rawValue.includes("data:image/")) {
    return rawValue
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return rawValue
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseAmenities(rawValue?: string) {
  if (!rawValue?.trim()) {
    return [] as string[];
  }

  return rawValue
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildDraftPayload(draft: Partial<BecomeHostFormData>) {
  return {
    title: draft.propertyTitle?.trim() || "",
    type: draft.propertyType || "villa",
    address: draft.address || "",
    city: draft.city || "",
    country: draft.country || "India",
    pricePerNight: Number(draft.nightlyPrice || 0),
    maxGuests: Number(draft.maxGuests || 0),
    bedrooms: Number(draft.bedrooms || 0),
    bathrooms: Number(draft.bathrooms || 0),
    description: draft.description || "",
    amenities: parseAmenities(draft.amenities),
    images: parseImageEntries(draft.imageUrls),
    checkInTime: draft.checkInTime || "14:00",
    checkOutTime: draft.checkOutTime || "11:00",
    allowSmoking: Boolean(draft.allowSmoking),
    allowPets: Boolean(draft.allowPets),
    allowParties: Boolean(draft.allowParties),
  };
}

export default function HostDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: hostProperties = [], isLoading: isLoadingProperties } = useHostProperties();
  const { data: hostStats } = useHostStats();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const archiveProperty = useArchiveProperty();
  const restoreProperty = useRestoreProperty();

  const [savedDraft, setSavedDraft] = useState<Partial<BecomeHostFormData> | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    type: "villa",
    address: "",
    city: "",
    country: "",
    pricePerNight: "",
    maxGuests: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    amenities: "",
    imageUrls: "",
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HOST_DRAFT_KEY);
      setSavedDraft(raw ? (JSON.parse(raw) as Partial<BecomeHostFormData>) : null);
    } catch {
      setSavedDraft(null);
    }
  }, []);

  const savedDraftImages = useMemo(() => parseImageEntries(savedDraft?.imageUrls), [savedDraft?.imageUrls]);

  const stats = useMemo(() => {
    const totalListings = hostStats?.totalListings ?? hostProperties.length;
    const activeListings = hostStats?.activeListings ?? hostProperties.filter((property) => property.isActive).length;
    const archivedListings = hostStats?.archivedListings ?? hostProperties.filter((property) => !property.isActive).length;
    const totalRevenue = hostStats?.totalRevenue ?? 0;
    const totalBookings = hostStats?.totalBookings ?? 0;
    const avgRating = hostStats?.avgRating ?? 0;

    return [
      { label: "Total Listings", value: String(totalListings), icon: Home },
      { label: "Active Listings", value: String(activeListings), icon: Calendar },
      { label: "Archived", value: String(archivedListings), icon: Archive },
      { label: "Revenue", value: formatCurrency(totalRevenue), icon: BarChart3 },
      { label: "Bookings", value: String(totalBookings), icon: Users },
      { label: "Avg Rating", value: totalListings ? avgRating.toFixed(2) : "-", icon: Star },
    ];
  }, [hostProperties, hostStats]);

  const handleHostDraft = async () => {
    if (!savedDraft) {
      toast({ title: "No saved setup found", variant: "destructive" });
      return;
    }

    const payload = buildDraftPayload(savedDraft);
    if (!payload.title || !payload.city || !payload.pricePerNight || !payload.maxGuests) {
      toast({
        title: "Setup incomplete",
        description: "Please complete title, city, nightly price, and guest capacity in your host form first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPublishing(true);
      await createProperty.mutateAsync(payload);
      window.localStorage.removeItem(HOST_DRAFT_KEY);
      setSavedDraft(null);
      toast({ title: "Listing hosted", description: "Your property is now live and reservable." });
    } catch (error: any) {
      toast({
        title: "Could not host listing",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const openEditDialog = (property: Property) => {
    setEditingProperty(property);
    setEditForm({
      title: property.title,
      type: property.type,
      address: property.location?.address || "",
      city: property.location?.city || "",
      country: property.location?.country || "",
      pricePerNight: String(property.pricePerNight),
      maxGuests: String(property.maxGuests),
      bedrooms: String(property.bedrooms || 0),
      bathrooms: String(property.bathrooms || 0),
      description: property.description || "",
      amenities: property.amenities.join(", "),
      imageUrls: property.images.join("\n"),
    });
  };

  const handleEditImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const existing = parseImageEntries(editForm.imageUrls);
    const remainingSlots = Math.max(0, 6 - existing.length);
    const acceptedFiles = Array.from(files).slice(0, remainingSlots);

    const validFiles = acceptedFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: `${file.name} is not an image file.`, variant: "destructive" });
        return false;
      }
      if (file.size > 2.5 * 1024 * 1024) {
        toast({ title: "File too large", description: `${file.name} is larger than 2.5MB.`, variant: "destructive" });
        return false;
      }
      return true;
    });

    const uploadedDataUrls = await Promise.all(
      validFiles.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(new Error("Could not read image"));
            reader.readAsDataURL(file);
          }),
      ),
    );

    if (uploadedDataUrls.length > 0) {
      const next = [...existing, ...uploadedDataUrls].join("\n");
      setEditForm((prev) => ({ ...prev, imageUrls: next }));
    }

    event.target.value = "";
  };

  const removeEditImage = (indexToRemove: number) => {
    const next = parseImageEntries(editForm.imageUrls).filter((_, index) => index !== indexToRemove);
    setEditForm((prev) => ({ ...prev, imageUrls: next.join("\n") }));
  };

  const handleSaveEdit = async () => {
    if (!editingProperty) return;

    const normalizedTitle = editForm.title.trim();
    const normalizedCity = editForm.city.trim();
    const normalizedCountry = editForm.country.trim();
    const nightlyPrice = Number(editForm.pricePerNight || 0);

    if (!normalizedTitle || !normalizedCity) {
      toast({ title: "Missing required fields", description: "Title and city are required.", variant: "destructive" });
      return;
    }

    if (!Number.isFinite(nightlyPrice) || nightlyPrice <= 0) {
      toast({ title: "Invalid nightly price", description: "Enter a valid price greater than zero.", variant: "destructive" });
      return;
    }

    try {
      await updateProperty.mutateAsync({
        id: editingProperty.id,
        data: {
          title: normalizedTitle,
          type: editForm.type || editingProperty.type,
          address: editForm.address.trim(),
          city: normalizedCity,
          country: normalizedCountry || editingProperty.location?.country || "India",
          pricePerNight: nightlyPrice,
          maxGuests: Number(editForm.maxGuests || editingProperty.maxGuests),
          bedrooms: Number(editForm.bedrooms || editingProperty.bedrooms || 0),
          bathrooms: Number(editForm.bathrooms || editingProperty.bathrooms || 0),
          description: editForm.description.trim(),
          amenities: parseAmenities(editForm.amenities),
          images: parseImageEntries(editForm.imageUrls),
        },
      });
      setEditingProperty(null);
      toast({ title: "Listing updated" });
    } catch (error: any) {
      toast({
        title: "Could not update listing",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleArchiveListing = async (propertyId: string) => {
    try {
      await archiveProperty.mutateAsync(propertyId);
      toast({ title: "Listing archived", description: "It is hidden from public search but can be restored later." });
    } catch (error: any) {
      toast({
        title: "Could not archive listing",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRestoreListing = async (propertyId: string) => {
    try {
      await restoreProperty.mutateAsync(propertyId);
      toast({ title: "Listing restored", description: "It is visible and reservable again." });
    } catch (error: any) {
      toast({
        title: "Could not restore listing",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-foreground">Host Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your active listings, archive old ones, and restore them whenever you want.</p>
          </div>
          <Button className="rounded-full" onClick={() => navigate("/become-host")}>
            <Plus className="mr-2 h-4 w-4" /> Add New Property
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-2 font-heading text-2xl font-extrabold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {savedDraft && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Saved host setup</p>
                <h2 className="mt-1 font-heading text-xl font-bold text-foreground">
                  {savedDraft.propertyTitle || "Untitled property draft"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {(savedDraft.city || "City pending")} · {(savedDraft.country || "Country pending")} · {(savedDraft.propertyType || "Type pending")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  {savedDraft.nightlyPrice ? `${formatCurrency(Number(savedDraft.nightlyPrice))}/night` : "Price pending"}
                </div>
                <Button className="rounded-full" onClick={handleHostDraft} disabled={isPublishing || createProperty.isPending}>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {isPublishing || createProperty.isPending ? "Hosting..." : "Host this listing"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => navigate("/become-host", { state: { scrollToForm: true } })}
                >
                  Continue editing setup
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[170px_1fr]">
              <div className="overflow-hidden rounded-xl border border-border bg-muted">
                {savedDraftImages[0] ? (
                  <img src={savedDraftImages[0]} alt="Saved host property" className="h-28 w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-28 items-center justify-center text-xs text-muted-foreground">No photo yet</div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" /> Guests</div>
                  <p className="mt-1 text-base font-semibold text-foreground">{savedDraft.maxGuests || "-"}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><BedDouble className="h-3.5 w-3.5" /> Bedrooms</div>
                  <p className="mt-1 text-base font-semibold text-foreground">{savedDraft.bedrooms || "-"}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Bath className="h-3.5 w-3.5" /> Bathrooms</div>
                  <p className="mt-1 text-base font-semibold text-foreground">{savedDraft.bathrooms || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-bold text-foreground">My Listings</h2>
          {isLoadingProperties ? <p className="text-sm text-muted-foreground">Loading properties...</p> : null}
        </div>

        {hostProperties.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center text-sm text-muted-foreground">
            No hosted listings yet. Use "Host this listing" from your saved setup to publish your first property.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hostProperties.map((property) => (
              <div key={property.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="overflow-hidden rounded-xl bg-muted">
                  {property.images[0] ? (
                    <img src={property.images[0]} alt={property.title} className="h-44 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">No image</div>
                  )}
                </div>

                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="line-clamp-1 font-heading text-lg font-bold text-foreground">{property.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {property.location?.city}, {property.location?.country}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(property.pricePerNight)}/night</p>
                  </div>
                  <Badge variant={property.isActive ? "secondary" : "outline"}>
                    {property.isActive ? "Active" : "Archived"}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(property)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                  {property.isActive ? (
                    <Button variant="outline" size="sm" onClick={() => handleArchiveListing(property.id)}>
                      <Archive className="mr-1 h-3.5 w-3.5" /> Archive
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleRestoreListing(property.id)}>
                      <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restore
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={Boolean(editingProperty)} onOpenChange={(open) => !open && setEditingProperty(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Listing</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-background/70 p-4">
                <p className="text-sm font-semibold text-foreground">Basic details</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Listing title</label>
                    <Input value={editForm.title} onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Listing title" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Property type</label>
                    <select
                      value={editForm.type}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, type: event.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {["villa", "apartment", "hotel", "hostel", "resort", "cottage"].map((type) => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nightly price (INR)</label>
                    <Input value={editForm.pricePerNight} onChange={(event) => setEditForm((prev) => ({ ...prev, pricePerNight: event.target.value }))} placeholder="Nightly price" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Address</label>
                    <Input value={editForm.address} onChange={(event) => setEditForm((prev) => ({ ...prev, address: event.target.value }))} placeholder="Full address" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">City</label>
                    <Input value={editForm.city} onChange={(event) => setEditForm((prev) => ({ ...prev, city: event.target.value }))} placeholder="City" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Country</label>
                    <Input value={editForm.country} onChange={(event) => setEditForm((prev) => ({ ...prev, country: event.target.value }))} placeholder="Country" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background/70 p-4">
                <p className="text-sm font-semibold text-foreground">Capacity</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guests</label>
                    <Input value={editForm.maxGuests} onChange={(event) => setEditForm((prev) => ({ ...prev, maxGuests: event.target.value }))} placeholder="Guests" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bedrooms</label>
                    <Input value={editForm.bedrooms} onChange={(event) => setEditForm((prev) => ({ ...prev, bedrooms: event.target.value }))} placeholder="Bedrooms" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bathrooms</label>
                    <Input value={editForm.bathrooms} onChange={(event) => setEditForm((prev) => ({ ...prev, bathrooms: event.target.value }))} placeholder="Bathrooms" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background/70 p-4">
                <p className="text-sm font-semibold text-foreground">Listing content</p>
                <div className="mt-3 grid gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</label>
                    <Textarea rows={4} value={editForm.description} onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Describe your property" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amenities</label>
                    <Textarea rows={3} value={editForm.amenities} onChange={(event) => setEditForm((prev) => ({ ...prev, amenities: event.target.value }))} placeholder="Pool, Wi-Fi, parking..." />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">Photos</p>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
                    <UploadCloud className="h-3.5 w-3.5" /> Upload photos
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleEditImageUpload} />
                  </label>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {parseImageEntries(editForm.imageUrls).length === 0 ? (
                    <div className="col-span-3 rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No photos added yet</div>
                  ) : (
                    parseImageEntries(editForm.imageUrls).map((src, index) => (
                      <div key={`${src.slice(0, 14)}-${index}`} className="group relative overflow-hidden rounded-lg border border-border">
                        <img src={src} alt={`Listing image ${index + 1}`} className="h-20 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeEditImage(index)}
                          className="absolute right-1 top-1 rounded-full bg-black/65 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProperty(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={updateProperty.isPending}>{updateProperty.isPending ? "Saving..." : "Save changes"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
