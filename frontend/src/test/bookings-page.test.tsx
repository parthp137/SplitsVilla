import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Bookings from "@/pages/Bookings";
import { useBookings } from "@/hooks/useApi";

const navigateMock = vi.fn();

vi.mock("@/hooks/useApi", () => ({
  useBookings: vi.fn(),
}));

vi.mock("@/components/common/Navbar", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe("Bookings page", () => {
  it("shows empty state and navigates to search", () => {
    vi.mocked(useBookings).mockReturnValue({ data: [], isLoading: false } as any);

    render(
      <MemoryRouter>
        <Bookings />
      </MemoryRouter>,
    );

    expect(screen.getByText("No bookings yet. Start exploring properties!")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Browse Properties" }));
    expect(navigateMock).toHaveBeenCalledWith("/search");
  });

  it("renders booking cards when data exists", () => {
    vi.mocked(useBookings).mockReturnValue({
      data: [
        {
          id: "b1",
          checkIn: "2026-05-10",
          checkOut: "2026-05-13",
          nights: 3,
          guests: 4,
          totalPrice: 36000,
          status: "confirmed",
          property: {
            id: "p1",
            title: "Sunset Villa",
            images: ["/test.jpg"],
            location: { city: "Goa" },
          },
        },
      ],
      isLoading: false,
    } as any);

    render(
      <MemoryRouter>
        <Bookings />
      </MemoryRouter>,
    );

    expect(screen.getByText("Sunset Villa")).toBeInTheDocument();
    expect(screen.getByText("confirmed")).toBeInTheDocument();
  });
});