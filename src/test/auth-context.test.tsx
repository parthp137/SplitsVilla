import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import type { User } from "@/types";

vi.mock("@/services/api", () => ({
  api: {
    setToken: vi.fn(),
    getProfile: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

const buildUser = (): User => ({
  id: "u1",
  name: "Test User",
  email: "test@example.com",
  currencyPreference: "INR",
  role: "guest",
  isVerified: true,
  wishlist: [],
  createdAt: new Date().toISOString(),
});

function AuthConsumer() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  return (
    <div>
      <p data-testid="auth-state">{isAuthenticated ? "yes" : "no"}</p>
      <p data-testid="loading-state">{isLoading ? "loading" : "ready"}</p>
      <p data-testid="user-name">{user?.name || "none"}</p>
      <button onClick={() => login("test@example.com", "password")}>Sign In</button>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(api.getProfile).mockResolvedValue(buildUser());
    vi.mocked(api.login).mockResolvedValue({ token: "abc", user: buildUser() });
  });

  it("logs in and logs out through context actions", async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("loading-state")).toHaveTextContent("ready"));
    expect(screen.getByTestId("auth-state")).toHaveTextContent("no");

    fireEvent.click(screen.getByText("Sign In"));

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("yes"));
    expect(screen.getByTestId("user-name")).toHaveTextContent("Test User");

    fireEvent.click(screen.getByText("Sign Out"));

    expect(api.logout).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("auth-state")).toHaveTextContent("no");
  });
});