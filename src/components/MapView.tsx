import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "leaflet.markercluster";
import { Property } from "@/types";

interface MapViewProps {
  properties: Property[];
  selectedId?: string;
  onPropertyClick?: (id: string) => void;
}

// Property type to color mapping
const typeColors: { [key: string]: string } = {
  villa: "#FF385C",      // Red/Pink (primary)
  apartment: "#FF7E1F",  // Orange
  hotel: "#0E88D9",      // Blue
  hostel: "#1DB954",     // Green
  resort: "#9D4EDD",     // Purple
  cottage: "#FB5607",    // Orange-Red
};

// Create dynamic icon based on property type and rating
const createIcon = (type: string, isSelected: boolean, rating: number) => {
  const color = typeColors[type.toLowerCase()] || "#FF385C";
  const size = isSelected ? 45 : Math.min(40, 25 + rating / 0.2); // Larger icons for higher ratings
  const pulse = isSelected ? "animate-pulse" : "";

  const html = `
    <div class="${pulse}" style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: all 0.2s ease;
      ${isSelected ? `box-shadow: 0 0 20px ${color}, 0 4px 15px rgba(0,0,0,0.3);` : ""}
    ">
      ⭐
    </div>
  `;

  return L.divIcon({
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 10],
    className: "custom-marker-icon",
  });
};

export default function MapView({ properties, selectedId, onPropertyClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    // Initialize map only if DOM element exists
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    if (!mapRef.current) {
      try {
        mapRef.current = L.map("map").setView([20.5937, 78.9629], 5);

        // Add vibrant tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapRef.current);

        // Create cluster group
        clusterGroupRef.current = new (L as any).MarkerClusterGroup({
          chunkedLoading: true,
          maxClusterRadius: 60,
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount();
            const size = count < 10 ? 40 : count < 50 ? 50 : 60;
            return L.divIcon({
              html: `<div style="
                background: linear-gradient(135deg, #FF385C, #FF7E1F);
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
              ">${count}</div>`,
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
            });
          },
        });

        mapRef.current.addLayer(clusterGroupRef.current);
      } catch (error) {
        console.error("Map initialization error:", error);
      }
    }
  }, []);

  // Add styles for animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse-animation {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.15); opacity: 0.8; }
      }
      .animate-pulse {
        animation: pulse-animation 2s infinite;
      }
      .leaflet-popup-content-wrapper {
        border-radius: 12px !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
      }
      .leaflet-popup-content {
        margin: 0 !important;
        width: 240px;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Add/update markers
  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;

    try {
      // Clear old markers
      clusterGroupRef.current.clearLayers();
      Object.values(markersRef.current).forEach((marker) => {
        if (marker.remove) marker.remove();
      });
      markersRef.current = {};

      const bounds = L.latLngBounds([]);

      properties.forEach((property) => {
        if (!property.location?.lat || !property.location?.lng) return;

        const lat = property.location.lat;
        const lng = property.location.lng;
        const isSelected = property.id === selectedId;

        const marker = L.marker([lat, lng], {
          icon: createIcon(property.type, isSelected, property.rating),
        }).bindPopup(`
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <img src="${property.images?.[0] || 'https://via.placeholder.com/240x180'}" 
              alt="${property.title}" 
              style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
            <h3 style="margin: 8px 0 4px; font-size: 14px; font-weight: 700; color: #222;">${property.title}</h3>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">${property.location.city}, ${property.location.address}</p>
            <div style="margin: 8px 0; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 16px; font-weight: 700; color: #FF385C;">₹${property.pricePerNight.toLocaleString()}/night</span>
              <span style="background: #FFE5E5; color: #FF385C; padding: 2px 6px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                ⭐ ${property.rating} (${property.reviewCount})
              </span>
            </div>
            <div style="margin: 6px 0; font-size: 11px; color: #999;">
              ${property.bedrooms} bd • ${property.maxGuests} guests • ${property.type}
            </div>
            <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px;">
              ${property.amenities.slice(0, 3).map(a => 
                `<span style="background: #F0F0F0; padding: 2px 6px; border-radius: 4px; font-size: 10px; color: #555;">${a}</span>`
              ).join("")}
              ${property.amenities.length > 3 ? `<span style="background: #F0F0F0; padding: 2px 6px; border-radius: 4px; font-size: 10px; color: #555;">+${property.amenities.length - 3}</span>` : ""}
            </div>
          </div>
        `, {
          maxWidth: 280,
          minWidth: 240,
        }).on("click", () => {
          onPropertyClick?.(property.id);
          mapRef.current?.setView([lat, lng], 14);
        });

        clusterGroupRef.current.addLayer(marker);
        markersRef.current[property.id] = marker;
        bounds.extend([lat, lng]);
      });

      // Fit bounds to all markers
      if (properties.length > 0 && bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (error) {
      console.error("Error updating map markers:", error);
    }
  }, [properties, selectedId, onPropertyClick]);

  return (
    <div
      id="map"
      className="h-full w-full rounded-2xl"
      style={{ minHeight: "500px" }}
    />
  );
}
