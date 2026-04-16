import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Command, X, Search, Heart, Map,Calendar, MapPin, Settings, LogOut, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: "navigation" | "search" | "account";
  shortcut?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "home",
      label: "Dashboard",
      description: "Go to home dashboard",
      icon: <Home className="h-4 w-4" />,
      action: () => {
        navigate("/dashboard");
        setIsOpen(false);
      },
      category: "navigation",
      shortcut: "⌘D",
    },
    {
      id: "search",
      label: "Search",
      description: "Search for properties",
      icon: <Search className="h-4 w-4" />,
      action: () => {
        navigate("/search");
        setIsOpen(false);
      },
      category: "navigation",
      shortcut: "⌘S",
    },
    {
      id: "wishlist",
      label: "Wishlist",
      description: "View your wishlist",
      icon: <Heart className="h-4 w-4" />,
      action: () => {
        navigate("/wishlist");
        setIsOpen(false);
      },
      category: "navigation",
      shortcut: "⌘W",
    },
    {
      id: "trips",
      label: "My Trips",
      description: "View your trips",
      icon: <Map className="h-4 w-4" />,
      action: () => {
        navigate("/dashboard/trips");
        setIsOpen(false);
      },
      category: "navigation",
      shortcut: "⌘T",
    },
    {
      id: "bookings",
      label: "Bookings",
      description: "View your bookings",
      icon: <Calendar className="h-4 w-4" />,
      action: () => {
        navigate("/bookings");
        setIsOpen(false);
      },
      category: "navigation",
      shortcut: "⌘B",
    },
    // Account
    {
      id: "settings",
      label: "Settings",
      description: "Configure your preferences",
      icon: <Settings className="h-4 w-4" />,
      action: () => {
        navigate("/settings");
        setIsOpen(false);
      },
      category: "account",
      shortcut: "⌘,",
    },
    {
      id: "logout",
      label: "Logout",
      description: "Sign out from your account",
      icon: <LogOut className="h-4 w-4" />,
      action: () => {
        logout();
        navigate("/");
        setIsOpen(false);
      },
      category: "account",
      shortcut: "⌘L",
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setSearchQuery("");
        setSelectedIndex(0);
      }

      // ESC to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchQuery("");
      }

      // Arrow keys for navigation
      if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          );
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }
        // Enter to execute
        if (e.key === "Enter" && filteredCommands[selectedIndex]) {
          e.preventDefault();
          filteredCommands[selectedIndex].action();
        }
      }

      // Quick navigation shortcuts
      if (e.metaKey || e.ctrlKey) {
        const quickCommand = commands.find((cmd) => {
          if (e.key === "d") return cmd.id === "home";
          if (e.key === "s") return cmd.id === "search";
          if (e.key === "w") return cmd.id === "wishlist";
          if (e.key === "t") return cmd.id === "trips";
          if (e.key === "b") return cmd.id === "bookings";
          if (e.key === ",") return cmd.id === "settings";
          if (e.key === "l") return cmd.id === "logout";
          return false;
        });

        if (quickCommand && !isOpen) {
          e.preventDefault();
          quickCommand.action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      {/* Keyboard shortcut hint - only show if user is authenticated */}
      {user && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="hidden fixed bottom-4 right-4 lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-all border border-primary/20 z-40"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Press Cmd+K (Mac) or Ctrl+K (Windows)"
        >
          <Command className="h-3 w-3" />
          <span className="hidden sm:inline">K</span>
        </motion.button>
      )}

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Command Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="rounded-xl border border-primary/20 bg-background shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="border-b border-primary/10 p-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Search commands..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedIndex(0);
                      }}
                      className="border-0 focus-visible:ring-0 focus-visible:outline-none"
                    />
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Commands List */}
                {filteredCommands.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto p-2">
                    {filteredCommands.map((cmd, index) => (
                      <motion.button
                        key={cmd.id}
                        onClick={() => cmd.action()}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors my-1 flex items-center justify-between ${
                          index === selectedIndex
                            ? "bg-primary/20 text-primary"
                            : "text-foreground hover:bg-muted"
                        }`}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{cmd.icon}</span>
                          <div>
                            <p className="text-sm font-medium">{cmd.label}</p>
                            <p className="text-xs text-muted-foreground">{cmd.description}</p>
                          </div>
                        </div>
                        {cmd.shortcut && (
                          <Badge variant="outline" className="text-xs font-mono">
                            {cmd.shortcut}
                          </Badge>
                        )}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No commands found</p>
                  </div>
                )}

                {/* Footer Help */}
                <div className="border-t border-primary/10 bg-muted/50 px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-background border border-primary/20 text-foreground text-xs font-mono">↑↓</kbd> to navigate</span>
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-background border border-primary/20 text-foreground text-xs font-mono">↵</kbd> to select</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default CommandPalette;
