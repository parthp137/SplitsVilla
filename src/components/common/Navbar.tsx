import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, Plus, User, LogOut, Map, Heart, Calendar, Home, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useApi";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 lg:h-18 lg:px-8">
        <Link to="/" className="flex items-center gap-3 rounded-2xl px-2 py-1 transition-colors hover:bg-accent/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-sm font-black text-primary-foreground shadow-card">
            SV
          </div>
          <div className="leading-tight">
            <p
              className="text-xl text-foreground sm:text-2xl"
              style={{ fontFamily: '"Segoe Script", "Lucida Handwriting", cursive' }}
            >
              Splits<span className="text-primary">Villa</span>
            </p>
            <p className="hidden text-xs text-muted-foreground sm:block">Plan. Split. Go.</p>
          </div>
        </Link>

        <button
          onClick={() => navigate("/search?focus=1")}
          className="hidden items-center gap-3 rounded-full border border-border/70 bg-card/80 px-5 py-2 text-left shadow-card transition-all hover:border-primary/30 hover:shadow-card-hover md:flex"
          aria-label="Search properties"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Search className="h-4 w-4" />
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold text-foreground">Search properties</span>
            <span className="text-xs text-muted-foreground">Find stays, dates, and guests</span>
          </span>
        </button>

        <div className="flex items-center gap-1 lg:gap-2">
          {isAuthenticated && (
            <Link
              to="/host"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent/80 md:block"
            >
              Become a Host
            </Link>
          )}

          {/* Desktop navigation links */}
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent/80 lg:block"
              >
                Dashboard
              </Link>
              <Link
                to="/dashboard/trips"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent/80 lg:block"
              >
                Trips
              </Link>
              <Link
                to="/wishlist"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent/80 lg:block"
              >
                Wishlist
              </Link>
              <Link
                to="/bookings"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent/80 lg:block"
              >
                Bookings
              </Link>
            </>
          )}

          {isAuthenticated && (
            <button
              onClick={() => navigate("/notifications")}
              className="relative rounded-full p-2.5 transition-colors hover:bg-accent"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 transition-all hover:border-primary/30 hover:shadow-card"
              aria-label="Open user menu"
            >
              <Menu className="h-4 w-4 text-foreground" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                {user ? (
                  <span className="text-sm font-semibold text-foreground">{user.name[0]}</span>
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-14 z-50 max-h-96 w-56 overflow-y-auto rounded-2xl border border-border/70 bg-card py-2 shadow-2xl">
                  {isAuthenticated ? (
                    <>
                      <div className="sticky top-0 border-b border-border bg-card px-4 py-3">
                        <p className="font-semibold text-foreground">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <Home className="h-4 w-4" /> Dashboard
                      </Link>
                      <Link
                        to="/dashboard/trips"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <Map className="h-4 w-4" /> My Trips
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <Heart className="h-4 w-4" /> Wishlist
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <Calendar className="h-4 w-4" /> Bookings
                      </Link>
                      <Link
                        to="/notifications"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <Bell className="h-4 w-4" /> Notifications
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <LogOut className="h-4 w-4" /> Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <User className="h-4 w-4" /> Log in
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <Plus className="h-4 w-4" /> Sign up
                      </Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
