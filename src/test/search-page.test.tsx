import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import SearchPage from "@/pages/Search";
import { useSearchProperties } from "@/hooks/useApi";

vi.mock("@/hooks/useApi", () => ({
  useSearchProperties: vi.fn(),
}));

vi.mock("@/components/common/Navbar", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("@/components/property/PropertyCard", () => ({
  default: ({ property }: { property: { title: string } }) => <div>{property.title}</div>,
}));

describe("Search page", () => {
  it("filters results by query text", () => {
    vi.mocked(useSearchProperties).mockReturnValue({
      data: [
        {
          id: "p1",
          title: "Goa Beach Villa",
          type: "villa",
          location: { city: "Goa", country: "India" },
          pricePerNight: 12000,
          rating: 4.8,
        },
        {
          id: "p2",
          title: "Manali Retreat",
          type: "villa",
          location: { city: "Manali", country: "India" },
          pricePerNight: 9000,
          rating: 4.3,
        },
      ],
      isLoading: false,
    } as any);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Goa Beach Villa")).toBeInTheDocument();
    expect(screen.getByText("Manali Retreat")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search by city, property name..."), {
      target: { value: "goa" },
    });

    expect(screen.getByText("Goa Beach Villa")).toBeInTheDocument();
    expect(screen.queryByText("Manali Retreat")).not.toBeInTheDocument();
  });
});