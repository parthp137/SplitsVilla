import { api } from "@/services/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Navbar from "@/components/common/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import CommandPalette from "@/components/CommandPalette";
import { FormSkeleton } from "@/components/SkeletonLoaders";

// Lazy load page components for code splitting
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const PasswordReset = lazy(() => import("./pages/PasswordReset"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyTrips = lazy(() => import("./pages/MyTrips"));
const CreateTrip = lazy(() => import("./pages/CreateTrip"));
const TripDetail = lazy(() => import("./pages/TripDetail"));
const SearchPage = lazy(() => import("./pages/Search"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const CurrencyConverter = lazy(() => import("./pages/CurrencyConverter"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const TripHistory = lazy(() => import("./pages/TripHistory"));
const JoinTrip = lazy(() => import("./pages/JoinTrip"));
const HostDashboard = lazy(() => import("./pages/HostDashboard"));
const BecomeAHost = lazy(() => import("./pages/BecomeAHost"));
const Settings = lazy(() => import("./pages/Settings"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NotFound = lazy(() => import("./pages/NotFound"));


function ServerWakeUpBanner() {
  const [isWakingUp, setIsWakingUp] = React.useState(false);

  React.useEffect(() => {
    const handleWakingUp = (e: Event) => {
      const customEvent = e as CustomEvent<{ wakingUp: boolean }>;
      setIsWakingUp(Boolean(customEvent.detail?.wakingUp));
    };
    window.addEventListener("sv:waking-up", handleWakingUp);
    return () => {
      window.removeEventListener("sv:waking-up", handleWakingUp);
    };
  }, []);

  if (!isWakingUp) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-950/90 px-4 py-3 text-xs font-medium text-amber-200 shadow-xl backdrop-blur transition-all duration-300"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
      </span>
      <span>Server is waking up, this can take up to a minute...</span>
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => {
  // Apply dark mode to root on mount and fire warm-up ping
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
    // Fire-and-forget warm-up to wake up Render free tier backend
    api.getHealth().catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Navbar />
            <ServerWakeUpBanner />
            <CommandPalette />
            <main className="min-h-[calc(100vh-4rem)]">
              <Suspense fallback={<FormSkeleton />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/password-reset" element={<PasswordReset />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/trips"
                    element={
                      <ProtectedRoute>
                        <MyTrips />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/trips/create"
                    element={
                      <ProtectedRoute>
                        <CreateTrip />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/trips/create"
                    element={
                      <ProtectedRoute>
                        <CreateTrip />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/trips/:id"
                    element={
                      <ProtectedRoute>
                        <TripDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/join/:code" element={<JoinTrip />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/properties/:id" element={<PropertyDetail />} />
                  <Route path="/property/:id" element={<PropertyDetail />} />
                  <Route path="/converter" element={<CurrencyConverter />} />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bookings"
                    element={
                      <ProtectedRoute>
                        <Bookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <TripHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/history"
                    element={
                      <ProtectedRoute>
                        <TripHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/trips/history"
                    element={
                      <ProtectedRoute>
                        <TripHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/become-host" element={<BecomeAHost />} />
                  <Route
                    path="/host"
                    element={
                      <ProtectedRoute requiredRole="host">
                        <HostDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute requiredRole="host">
                        <Analytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
      </ErrorBoundary>
    );
  };

  export default App;
