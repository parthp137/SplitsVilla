import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "leaflet.markercluster";
import { Property } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";
import { Layers, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapViewProps {
  properties: Property[];
  selectedId?: string;
  hoveredId?: string;
  onPropertyClick?: (id: string) => void;
  onPropertyHover?: (id: string | null) => void;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
}

// Property type to color mapping
const typeColors: { [key: string]: string } = {
  villa: "#FF385C",      // Red/Pink
  apartment: "#FF7E1F",  // Orange
  hotel: "#0E88D9",      // Blue
  hostel: "#1DB954",     // Green
  resort: "#9D4EDD",     // Purple
  cottage: "#FB5607",    // Orange-Red
};

// Create dynamic pill icon with price
const createPillIcon = (price: number, isSelected: boolean, isHovered: boolean) => {
  const active = isSelected || isHovered;
  const bg = active ? "#0f172a" : "#ffffff";
  const textColor = active ? "#ffffff" : "#0f172a";
  const border = active ? "2px solid #3b82f6" : "1.5px solid rgba(0,0,0,0.12)";
  const scale = active ? "scale(1.15)" : "scale(1)";
  const zIndex = active ? 999 : 1;
  const shadow = active
    ? "0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)"
    : "0 4px 12px rgba(0,0,0,0.18)";

  const formattedPrice = price >= 1000 ? `₹${Math.round(price / 1000)}k` : `₹${price}`;

  const html = `
    <div style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: ${bg};
      color: ${textColor};
      border: ${border};
      padding: 4px 8px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: ${shadow};
      transform: ${scale};
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      cursor: pointer;
      white-space: nowrap;
      z-index: ${zIndex};
    ">
      ${formattedPrice}
    </div>
  `;

  return L.divIcon({
    html,
    iconSize: [60, 28],
    iconAnchor: [30, 14],
    popupAnchor: [0, -18],
    className: "custom-price-pill",
  });
};

export default function MapView({
  properties,
  selectedId,
  hoveredId,
  onPropertyClick,
  onPropertyHover,
  onBoundsChange,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [searchAsMove, setSearchAsMove] = useState(false);

  useEffect(() => {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    if (!mapRef.current) {
      try {
        mapRef.current = L.map("map", {
          zoomControl: false,
        }).setView([20.5937, 78.9629], 5);

        // Add zoom control to top-right
        L.control.zoom({ position: "topright" }).addTo(mapRef.current);

        // CartoDB Voyager or OSM Tile layer
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(mapRef.current);

        clusterGroupRef.current = new (L as any).MarkerClusterGroup({
          chunkedLoading: true,
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount();
            return L.divIcon({
              html: `<div style="
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 13px;
                box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
                border: 2px solid white;
              ">${count}</div>`,
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            });
          },
        });

        mapRef.current.addLayer(clusterGroupRef.current);

        // Handle bounds move
        mapRef.current.on("moveend", () => {
          if (mapRef.current && onBoundsChange) {
            onBoundsChange(mapRef.current.getBounds());
          }
        });
      } catch (error) {
        console.error("Map initialization error:", error);
      }
    }
  }, []);

  // Sync popup or icon highlight when hoveredId / selectedId changes
  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;

    try {
      clusterGroupRef.current.clearLayers();
      markersRef.current = {};

      const bounds = L.latLngBounds([]);

      properties.forEach((property) => {
        if (!property.location?.lat || !property.location?.lng) return;

        const lat = property.location.lat;
        const lng = property.location.lng;
        const isSelected = property.id === selectedId;
        const isHovered = property.id === hoveredId;

        const marker = L.marker([lat, lng], {
          icon: createPillIcon(property.pricePerNight, isSelected, isHovered),
          zIndexOffset: isSelected || isHovered ? 1000 : 0,
        }).bindPopup(`
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2px;">
            <img src="${property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}" 
              alt="${property.title}" 
              style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
            <h3 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #111; line-height: 1.3;">${property.title}</h3>
            <p style="margin: 0 0 6px; font-size: 11px; color: #666;">${property.location.city}, ${property.location.country}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 6px;">
              <span style="font-size: 14px; font-weight: 800; color: #3b82f6;">₹${property.pricePerNight.toLocaleString()}<span style="font-size: 10px; font-weight: 400; color: #666;">/nt</span></span>
              <span style="background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 6px; font-size: 11px; font-weight: 600;">
                ⭐ ${property.rating}
              </span>
            </div>
          </div>
        `, {
          maxWidth: 240,
          minWidth: 200,
          closeButton: false,
        });

        marker.on("click", () => {
          onPropertyClick?.(property.id);
          mapRef.current?.setView([lat, lng], 14, { animate: true });
        });

        marker.on("mouseover", () => {
          onPropertyHover?.(property.id);
        });

        marker.on("mouseout", () => {
          onPropertyHover?.(null);
        });

        clusterGroupRef.current.addLayer(marker);
        markersRef.current[property.id] = marker;
        bounds.extend([lat, lng]);

        if (isSelected || isHovered) {
          marker.openPopup();
        }
      });

      // Fit bounds when property count changes
      if (properties.length > 0 && bounds.isValid() && !selectedId && !hoveredId) {
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    } catch (error) {
      console.error("Error updating map markers:", error);
    }
  }, [properties, selectedId, hoveredId, onPropertyClick, onPropertyHover]);

  return (
    <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-inner">
      <div
        id="map"
        className="h-full w-full"
        style={{ minHeight: "500px" }}
      />

      {/* Floating Map Controls overlay */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/70 shadow-md text-xs">
        <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
          <input
            type="checkbox"
            checked={searchAsMove}
            onChange={(e) => setSearchAsMove(e.target.checked)}
            className="rounded border-primary text-primary focus:ring-primary h-3.5 w-3.5"
          />
          <span>Search as I move map</span>
        </label>
      </div>
    </div>
  );
}
