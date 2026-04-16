import { motion } from "framer-motion";

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl border border-primary/20 overflow-hidden bg-card">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-r from-primary/20 to-secondary/20 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-primary/20 rounded w-3/4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-white to-transparent"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="h-3 bg-primary/10 rounded w-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-white to-transparent"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
          />
        </div>
        <div className="h-3 bg-primary/10 rounded w-2/3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-white to-transparent"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4 p-4 rounded-lg border border-primary/20 bg-card">
          <div className="h-32 w-32 rounded-lg bg-primary/20 shrink-0 overflow-hidden">
            <motion.div
              className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-primary/20 rounded w-1/2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ x: ["100%", "-100%"] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="h-4 bg-primary/10 rounded w-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ x: ["100%", "-100%"] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
              />
            </div>
            <div className="h-4 bg-primary/10 rounded w-2/3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ x: ["100%", "-100%"] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="h-12 bg-primary/20 rounded-lg w-1/3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-white to-transparent"
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-primary/20 rounded-lg overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-primary/20 rounded-lg overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-primary/20 rounded w-1/4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="h-10 bg-primary/20 rounded overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            />
          </div>
        </div>
      ))}
      <div className="h-10 bg-primary/40 rounded w-1/4 mt-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-white to-transparent"
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  );
}
