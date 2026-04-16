import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
        animate={{
          x: [0, 100, -100, 0],
          y: [0, 50, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute -right-40 top-1/2 h-80 w-80 rounded-full bg-secondary/20 blur-3xl"
        animate={{
          x: [0, -100, 100, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
        animate={{
          x: [0, 50, -50, 0],
          y: [0, 100, -100, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

export function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10 blur-2xl"
          style={{
            width: Math.random() * 300 + 100,
            height: Math.random() * 300 + 100,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

interface SectionBackgroundProps {
  variant?: "gradient1" | "gradient2" | "gradient3" | "dark";
}

export function SectionBackground({ variant = "gradient1" }: SectionBackgroundProps) {
  const gradients = {
    gradient1: "from-primary/5 via-background to-secondary/5",
    gradient2: "from-secondary/5 via-primary/5 to-background",
    gradient3: "from-background via-primary/10 to-secondary/10",
    dark: "from-foreground/5 via-background to-foreground/5",
  };

  return (
    <motion.div
      className={`absolute inset-0 bg-gradient-to-br ${gradients[variant]}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    />
  );
}
