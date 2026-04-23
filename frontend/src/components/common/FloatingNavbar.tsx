import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, X, Plus, User, LogOut, Map, Heart, Calendar, Home, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useApi";

export default function FloatingNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <>
      {/* Floating Navbar - Fixed on the side */}
      <motion.div
        className="fixed right-6 top-1/2 z-50 -translate-y-1/2 hidden lg:block"
        animate={{
          y: scrollY > 200 ? 0 : -50,
        }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative flex flex-col items-center gap-4 rounded-3xl border border-primary/30 bg-background/80 px-4 py-6 backdrop-blur-xl"
          animate={{
            boxShadow: [
              "0 0 30px rgba(249, 115, 22, 0.2)",
              "0 0 60px rgba(249, 115, 22, 0.4)",
              "0 0 30px rgba(249, 115, 22, 0.2)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          {/* Logo - Center */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="flex items-center justify-center">
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{ duration: 20, repeat: Infinity }}
              >
                <Home className="h-6 w-6 text-white" />
              </motion.div>
            </Link>
          </motion.div>

          {/* Divider */}
          <motion.div
            className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-secondary"
            animate={{ scaleX: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Search */}
          <motion.button
            onClick={() => navigate("/search")}
            className="rounded-full p-3 transition-all hover:bg-primary/20"
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            title="Search"
            aria-label="Search properties"
          >
            <Search className="h-6 w-6 text-primary" />
          </motion.button>

          {/* Notifications */}
          {isAuthenticated && (
            <motion.div
              className="relative"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.button
                onClick={() => navigate("/notifications")}
                className="rounded-full p-3 transition-all hover:bg-primary/20"
                title="Notifications"
                aria-label="View notifications"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Bell className="h-6 w-6 text-primary" />
              </motion.button>
              {unreadCount > 0 && (
                <motion.span
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.div>
          )}

          {/* Wishlist */}
          <motion.button
            onClick={() => navigate("/wishlist")}
            className="rounded-full p-3 transition-all hover:bg-primary/20"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
            title="Wishlist"
            aria-label="View wishlist"
          >
            <Heart className="h-6 w-6 text-primary" />
          </motion.button>

          {/* Trips */}
          {isAuthenticated && (
            <motion.button
              onClick={() => navigate("/dashboard/trips")}
              className="rounded-full p-3 transition-all hover:bg-primary/20"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
              title="Trips"
              aria-label="View your trips"
            >
              <Map className="h-6 w-6 text-primary" />
            </motion.button>
          )}

          {/* Bookings */}
          {isAuthenticated && (
            <motion.button
              onClick={() => navigate("/bookings")}
              className="rounded-full p-3 transition-all hover:bg-primary/20"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
              title="Bookings"
              aria-label="View your bookings"
            >
              <Calendar className="h-6 w-6 text-primary" />
            </motion.button>
          )}

          {/* Divider */}
          <motion.div
            className="h-1 w-8 rounded-full bg-gradient-to-r from-secondary to-primary"
            animate={{ scaleX: [1.2, 1, 1.2] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* User Menu */}
          <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <motion.button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="rounded-full p-3 transition-all hover:bg-primary/20"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle user menu"
              animate={{
                backgroundColor: userMenuOpen ? "rgba(249, 115, 22, 0.2)" : "rgba(0, 0, 0, 0)",
              }}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                {user ? user.name[0] : <User className="h-3 w-3" />}
              </div>
            </motion.button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  className="absolute bottom-20 right-0 z-50 w-48 overflow-hidden rounded-2xl border border-primary/30 bg-background/95 shadow-2xl backdrop-blur-md"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {isAuthenticated ? (
                    <>
                      <motion.div
                        className="border-b border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </motion.div>
                      {[
                        { icon: Home, label: "Dashboard", path: "/dashboard" },
                        { icon: Settings, label: "Settings", path: "/settings" },
                      ].map((item, i) => (
                        <motion.div key={item.path} custom={i} variants={menuItemVariants} initial="hidden" animate="show">
                          <Link
                            to={item.path}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm transition-all hover:bg-primary/10"
                          >
                            <item.icon className="h-4 w-4 text-primary" />
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                      <motion.button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 border-t border-primary/20 px-4 py-2 text-sm transition-all hover:bg-destructive/10"
                        custom={2}
                        variants={menuItemVariants}
                        initial="hidden"
                        animate="show"
                      >
                        <LogOut className="h-4 w-4 text-destructive" />
                        Log out
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.div custom={0} variants={menuItemVariants} initial="hidden" animate="show">
                        <Link
                          to="/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm transition-all hover:bg-primary/10"
                        >
                          <User className="h-4 w-4 text-primary" />
                          Log in
                        </Link>
                      </motion.div>
                      <motion.div custom={1} variants={menuItemVariants} initial="hidden" animate="show">
                        <Link
                          to="/register"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 border-t border-primary/20 px-4 py-2 text-sm transition-all hover:bg-primary/10"
                        >
                          <Plus className="h-4 w-4 text-primary" />
                          Sign up
                        </Link>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Mobile Navbar - Bottom floating */}
      <motion.div
        className="fixed bottom-6 left-1/2 z-50 block -translate-x-1/2 lg:hidden"
        animate={{
          y: scrollY > 200 ? 0 : 20,
        }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-4 py-3 backdrop-blur-xl"
          animate={{
            boxShadow: [
              "0 0 30px rgba(249, 115, 22, 0.2)",
              "0 0 60px rgba(249, 115, 22, 0.4)",
              "0 0 30px rgba(249, 115, 22, 0.2)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link to="/">
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity }}
              >
                <Home className="h-5 w-5 text-white" />
              </motion.div>
            </Link>
          </motion.div>

          {/* Search */}
          <motion.button onClick={() => navigate("/search")} className="rounded-full p-2.5 transition-all hover:bg-primary/20" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Search className="h-5 w-5 text-primary" />
          </motion.button>

          {/* Wishlist */}
          <motion.button onClick={() => navigate("/wishlist")} className="rounded-full p-2.5 transition-all hover:bg-primary/20" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Heart className="h-5 w-5 text-primary" />
          </motion.button>

          {/* Notifications (if auth) */}
          {isAuthenticated && (
            <motion.div className="relative" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <motion.button onClick={() => navigate("/notifications")} className="rounded-full p-2.5 transition-all hover:bg-primary/20">
                <Bell className="h-5 w-5 text-primary" />
              </motion.button>
              {unreadCount > 0 && (
                <motion.span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  {unreadCount}
                </motion.span>
              )}
            </motion.div>
          )}

          {/* User Menu */}
          <motion.div className="relative" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <motion.button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="rounded-full p-2.5 transition-all hover:bg-primary/20"
              animate={{
                backgroundColor: userMenuOpen ? "rgba(249, 115, 22, 0.2)" : "rgba(0, 0, 0, 0)",
              }}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[10px] font-bold text-white">
                {user ? user.name[0] : <User className="h-3 w-3" />}
              </div>
            </motion.button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  className="absolute -top-48 right-0 z-50 w-44 overflow-hidden rounded-2xl border border-primary/30 bg-background/95 shadow-2xl backdrop-blur-md"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {isAuthenticated ? (
                    <>
                      <motion.div className="border-b border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                        <p className="text-xs font-semibold text-foreground">{user?.name}</p>
                      </motion.div>
                      {[
                        { icon: Home, label: "Dashboard", path: "/dashboard" },
                        { icon: Settings, label: "Settings", path: "/settings" },
                      ].map((item, i) => (
                        <motion.div key={item.path} custom={i} variants={menuItemVariants} initial="hidden" animate="show">
                          <Link
                            to={item.path}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs transition-all hover:bg-primary/10"
                          >
                            <item.icon className="h-3 w-3 text-primary" />
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                      <motion.button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 border-t border-primary/20 px-4 py-2 text-xs transition-all hover:bg-destructive/10"
                        custom={2}
                        variants={menuItemVariants}
                        initial="hidden"
                        animate="show"
                      >
                        <LogOut className="h-3 w-3 text-destructive" />
                        Log out
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.div custom={0} variants={menuItemVariants} initial="hidden" animate="show">
                        <Link
                          to="/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs transition-all hover:bg-primary/10"
                        >
                          <User className="h-3 w-3 text-primary" />
                          Log in
                        </Link>
                      </motion.div>
                      <motion.div custom={1} variants={menuItemVariants} initial="hidden" animate="show">
                        <Link
                          to="/register"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 border-t border-primary/20 px-4 py-2 text-xs transition-all hover:bg-primary/10"
                        >
                          <Plus className="h-3 w-3 text-primary" />
                          Sign up
                        </Link>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
