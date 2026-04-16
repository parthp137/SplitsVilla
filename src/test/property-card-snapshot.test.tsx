import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PropertyCard from "@/components/property/PropertyCard";
import { Property } from "@/types";

// Mock property data
const mockProperty: Property = {
  id: "1",
  title: "Beautiful Beachfront Villa",
  description: "A stunning villa with ocean views",
  pricePerNight: 15000,
  type: "villa",
  location: "Goa, India",
  images: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500",
  ],
  amenities: ["WiFi", "Pool", "Kitchen", "Gym"],
  maxGuests: 8,
  rating: 4.8,
  reviews: 42,
  hostId: "host-1",
  createdAt: new Date("2024-01-01").toISOString(),
  updatedAt: new Date("2024-01-15").toISOString(),
};

describe("PropertyCard Snapshot", () => {
  it("renders correctly with default props", () => {
    const { container } = render(
      <BrowserRouter>
        <PropertyCard property={mockProperty} />
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders with wishlisted state", () => {
    const { container } = render(
      <BrowserRouter>
        <PropertyCard property={mockProperty} isWishlisted={true} />
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders with group size and per-person pricing", () => {
    const { container } = render(
      <BrowserRouter>
        <PropertyCard
          property={mockProperty}
          groupSize={4}
          showPerPerson={true}
        />
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders with callback props", () => {
    const mockCallback = vi.fn();
    const { container } = render(
      <BrowserRouter>
        <PropertyCard
          property={mockProperty}
          isWishlisted={false}
          onWishlistToggle={mockCallback}
        />
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders low-rating property", () => {
    const lowRatedProperty: Property = {
      ...mockProperty,
      rating: 3.2,
      reviews: 5,
    };
    const { container } = render(
      <BrowserRouter>
        <PropertyCard property={lowRatedProperty} />
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });

  it("renders premium property with high rating and reviews", () => {
    const premiumProperty: Property = {
      ...mockProperty,
      title: "Luxury 5-Star Resort",
      pricePerNight: 50000,
      rating: 4.9,
      reviews: 287,
    };
    const { container } = render(
      <BrowserRouter>
        <PropertyCard property={premiumProperty} />
      </BrowserRouter>
    );
    expect(container).toMatchSnapshot();
  });
});
