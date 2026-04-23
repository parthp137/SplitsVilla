const WISHLIST_STORAGE_KEY = "sv_wishlist_ids";

function normalizeIds(ids: string[]) {
  return Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));
}

export function readWishlistIds() {
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? normalizeIds(parsed) : [];
  } catch {
    return [];
  }
}

export function writeWishlistIds(ids: string[]) {
  const normalized = normalizeIds(ids);
  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function toggleWishlistId(propertyId: string) {
  const current = readWishlistIds();
  const exists = current.includes(propertyId);
  const next = exists ? current.filter((id) => id !== propertyId) : [propertyId, ...current];
  const persisted = writeWishlistIds(next);

  return {
    wishlistIds: persisted,
    isWishlisted: !exists,
  };
}
