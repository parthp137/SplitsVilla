import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import FloatingNavbar from "@/components/common/FloatingNavbar";
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
const HostDashboard = lazy(() => import("./pages/HostDashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  // Apply dark mode to root on mount
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
    
    // Token validation on app startup
    const token = localStorage.getItem("token");
    if (token) {
      const validateToken = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/profile`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
        } catch (error) {
          console.error("Token validation error:", error);
        }
      };
      validateToken();

      // Token refresh every 5 minutes
      const interval = setInterval(validateToken, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <FloatingNavbar />
            <CommandPalette />
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
                  path="/trips/:id"
                  element={
                    <ProtectedRoute>
                      <TripDetail />
                    </ProtectedRoute>
                  }
                />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
      </ErrorBoundary>
    );
  };

  export default App;
