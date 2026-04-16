import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, X, Plus, User, LogOut, Map, Heart, Calendar, Home, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useApi";

export default function AnimatedNavbar() {
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

  // Floating particles around navbar
  const particles = Array.from({ length: 5 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute h-2 w-2 rounded-full bg-primary/30"
      animate={{
        x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
        y: [Math.random() * 100 - 50, Math.random() * 100 - 50],
        scale: [1, 1.5, 1],
      }}
      transition={{ duration: 8 + i * 2, repeat: Infinity }}
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      }}
    />
  ));

  const menuItemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <motion.nav
      className="sticky top-0 z-50 overflow-hidden"
      animate={{
        backdropFilter: scrollY > 50 ? "blur(12px)" : "blur(8px)",
        backgroundColor: scrollY > 50 ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.6)",
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-0"
        animate={{
          opacity: scrollY > 50 ? 0.3 : 0.1,
          backgroundImage: [
            "radial-gradient(ellipse at 0% 0%, rgba(249, 115, 22, 0.3) 0%, transparent 60%)",
            "radial-gradient(ellipse at 100% 100%, rgba(250, 204, 21, 0.3) 0%, transparent 60%)",
            "radial-gradient(ellipse at 0% 0%, rgba(249, 115, 22, 0.3) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles}
      </div>

      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Animated Logo */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary"
              animate={{
                rotate: [0, 360],
                boxShadow: [
                  "0 0 20px rgba(249, 115, 22, 0.5)",
                  "0 0 40px rgba(250, 204, 21, 0.5)",
                  "0 0 20px rgba(249, 115, 22, 0.5)",
                ],
              }}
              transition={{ rotate: { duration: 20, repeat: Infinity }, boxShadow: { duration: 4, repeat: Infinity } }}
            >
              <Home className="h-5 w-5 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="font-heading text-2xl font-extrabold"
            >
              {["S", "p", "l", "i", "t", "s"].map((char, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="text-foreground inline-block"
                  animate={{
                    y: [0, -3, 0],
                    color: i % 2 === 0 ? "hsl(var(--foreground))" : "hsl(var(--primary))",
                  }}
                  transition={{
                    y: { delay: i * 0.05 + 0.2, duration: 2, repeat: Infinity },
                    color: { delay: i * 0.1, duration: 2, repeat: Infinity },
                  }}
                >
                  {char}
                </motion.span>
              ))}
              <motion.span
                className="text-primary inline-block"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(249, 115, 22, 0.5)",
                    "0 0 20px rgba(249, 115, 22, 0.8)",
                    "0 0 10px rgba(249, 115, 22, 0.5)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Villa
              </motion.span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Animated Search Pill - Desktop */}
        <motion.button
          onClick={() => navigate("/search")}
          className="hidden items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-6 py-3 backdrop-blur-md md:flex"
          whileHover={{
            scale: 1.05,
            borderColor: "rgba(249, 115, 22, 0.8)",
            boxShadow: "0 0 30px rgba(249, 115, 22, 0.4)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className="text-sm font-semibold text-card"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Anywhere
          </motion.span>
          <motion.span
            className="h-6 w-px bg-primary/30"
            animate={{ scaleY: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.span
            className="text-sm font-semibold text-card"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
          >
            Any week
          </motion.span>
          <motion.span
            className="h-6 w-px bg-primary/30"
            animate={{ scaleY: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <motion.span
            className="text-sm text-card/70"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
          >
            Add guests
          </motion.span>
          <motion.div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 3, repeat: Infinity },
              scale: { duration: 2, repeat: Infinity },
            }}
          >
            <Search className="h-4 w-4 text-white" />
          </motion.div>
        </motion.button>

        {/* Right side items */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <motion.button
              onClick={() => navigate("/host")}
              className="hidden rounded-full px-5 py-2.5 text-sm font-semibold text-card transition-all hover:shadow-lg md:block"
              whileHover={{
                scale: 1.05,
                background: "linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(250, 204, 21, 0.2))",
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Become a Host
            </motion.button>
          )}

          {isAuthenticated && (
            <motion.button
              onClick={() => navigate("/notifications")}
              className="relative rounded-full p-3 transition-all"
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(249, 115, 22, 0.15)",
              }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Bell className="h-5 w-5 text-card" />
              {unreadCount > 0 && (
                <motion.span
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[10px] font-bold text-white"
                  animate={{
                    scale: [1, 1.2, 1],
                    boxShadow: [
                      "0 0 10px rgba(249, 115, 22, 0.5)",
                      "0 0 20px rgba(249, 115, 22, 0.8)",
                      "0 0 10px rgba(249, 115, 22, 0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>
          )}

          {/* Animated User Menu */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <motion.button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-full border border-primary/30 px-3 py-2 transition-all"
              whileHover={{
                scale: 1.05,
                borderColor: "rgba(249, 115, 22, 0.8)",
                backgroundColor: "rgba(249, 115, 22, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                borderColor: userMenuOpen ? "rgba(249, 115, 22, 0.8)" : "rgba(249, 115, 22, 0.3)",
              }}
            >
              <motion.div animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <Menu className="h-4 w-4 text-card" />
              </motion.div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-secondary/40">
                {user ? (
                  <motion.span
                    className="text-sm font-bold text-card"
                    animate={{
                      scale: [1, 1.1, 1],
                      color: ["hsl(var(--card))", "hsl(var(--primary))", "hsl(var(--card))"],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {user.name[0]}
                  </motion.span>
                ) : (
                  <User className="h-4 w-4 text-card/70" />
                )}
              </div>
            </motion.button>

            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <motion.div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                  <motion.div
                    className="absolute right-0 top-16 z-50 w-64 overflow-hidden rounded-2xl border border-primary/30 bg-background/95 shadow-2xl backdrop-blur-md"
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {isAuthenticated ? (
                      <>
                        <motion.div
                          className="border-b border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <p className="font-semibold text-foreground">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </motion.div>
                        {[
                          { icon: Home, label: "Dashboard", path: "/dashboard" },
                          { icon: Map, label: "My Trips", path: "/dashboard/trips" },
                          { icon: Heart, label: "Wishlist", path: "/wishlist" },
                          { icon: Calendar, label: "Bookings", path: "/bookings" },
                          { icon: Settings, label: "Settings", path: "/settings" },
                        ].map((item, i) => (
                          <motion.div
                            key={item.path}
                            custom={i}
                            variants={menuItemVariants}
                            initial="hidden"
                            animate="show"
                          >
                            <Link
                              to={item.path}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 transition-all hover:bg-primary/10"
                            >
                              <item.icon className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-foreground">{item.label}</span>
                            </Link>
                          </motion.div>
                        ))}
                        <motion.button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 border-t border-primary/20 px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-destructive/10"
                          custom={5}
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
                        <motion.div
                          custom={0}
                          variants={menuItemVariants}
                          initial="hidden"
                          animate="show"
                        >
                          <Link
                            to="/login"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 transition-all hover:bg-primary/10"
                          >
                            <User className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">Log in</span>
                          </Link>
                        </motion.div>
                        <motion.div
                          custom={1}
                          variants={menuItemVariants}
                          initial="hidden"
                          animate="show"
                        >
                          <Link
                            to="/register"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 border-t border-primary/20 px-4 py-3 transition-all hover:bg-primary/10"
                          >
                            <Plus className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">Sign up</span>
                          </Link>
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
