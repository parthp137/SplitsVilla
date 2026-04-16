import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, X, Plus, User, LogOut, Map, Heart, Calendar, Home, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useApi";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:h-20 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-extrabold text-foreground">
            Splits<span className="text-primary">Villa</span>
          </span>
        </Link>

        {/* Center search pill - desktop */}
        <button
          onClick={() => navigate("/search")}
          className="hidden items-center gap-3 rounded-full border border-border bg-card px-6 py-2.5 shadow-card transition-shadow hover:shadow-card-hover md:flex"
        >
          <span className="text-sm font-semibold text-foreground">Anywhere</span>
          <span className="h-6 w-px bg-border" />
          <span className="text-sm font-semibold text-foreground">Any week</span>
          <span className="h-6 w-px bg-border" />
          <span className="text-sm text-muted-foreground">Add guests</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Search className="h-4 w-4 text-primary-foreground" />
          </div>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-1 lg:gap-2">
          {isAuthenticated && (
            <Link to="/host" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent md:block">
              Become a Host
            </Link>
          )}

          {/* Desktop Quick Navigation Icons */}
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className="hidden rounded-full p-2.5 transition-colors hover:bg-accent lg:block"
                title="Dashboard"
              >
                <Home className="h-5 w-5 text-foreground" />
              </Link>
              <Link
                to="/dashboard/trips"
                className="hidden rounded-full p-2.5 transition-colors hover:bg-accent lg:block"
                title="My Trips"
              >
                <Map className="h-5 w-5 text-foreground" />
              </Link>
              <Link
                to="/wishlist"
                className="hidden rounded-full p-2.5 transition-colors hover:bg-accent lg:block"
                title="Wishlist"
              >
                <Heart className="h-5 w-5 text-foreground" />
              </Link>
              <Link
                to="/bookings"
                className="hidden rounded-full p-2.5 transition-colors hover:bg-accent lg:block"
                title="Bookings"
              >
                <Calendar className="h-5 w-5 text-foreground" />
              </Link>
              <Link
                to="/settings"
                className="hidden rounded-full p-2.5 transition-colors hover:bg-accent lg:block"
                title="Settings"
              >
                <Settings className="h-5 w-5 text-foreground" />
              </Link>
            </>
          )}

          {isAuthenticated && (
            <button onClick={() => navigate("/notifications")} className="relative rounded-full p-2.5 transition-colors hover:bg-accent">
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
              className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 transition-shadow hover:shadow-card"
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
                <div className="absolute right-0 top-14 z-50 w-56 max-h-96 overflow-y-auto rounded-xl border border-border bg-card py-2 shadow-lg">
                  {isAuthenticated ? (
                    <>
                      <div className="border-b border-border px-4 py-2 sticky top-0 bg-card">
                        <p className="font-semibold text-foreground">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">
                        <Home className="h-4 w-4" /> Dashboard
                      </Link>
                      <Link to="/dashboard/trips" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">
                        <Map className="h-4 w-4" /> My Trips
                      </Link>
                      <Link to="/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">
                        <Heart className="h-4 w-4" /> Wishlist
                      </Link>
                      <Link to="/bookings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">
                        <Calendar className="h-4 w-4" /> Bookings
                      </Link>
                      <Link to="/notifications" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">
                        <Bell className="h-4 w-4" /> Notifications
                      </Link>
                      <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">
                        <User className="h-4 w-4" /> Log in
                      </Link>
                      <Link to="/register" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">
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
