import { motion, AnimationControls } from "framer-motion";
import React, { useEffect, useRef } from "react";

/* ============= SCROLLYTELLING ============= */
export function ScrollytellingSection({
  children,
  onScroll,
}: {
  children: React.ReactNode;
  onScroll?: (progress: number) => void;
}) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && onScroll) {
        const rect = entry.boundingClientRect;
        const progress = 1 - rect.top / window.innerHeight;
        onScroll(Math.max(0, Math.min(1, progress)));
      }
    });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onScroll]);

  return <div ref={ref}>{children}</div>;
}

/* ============= EXPRESSIVE TYPOGRAPHY ============= */
export function AnimatedTypography({
  text,
  delay = 0,
  duration = 0.05,
}: {
  text: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <div className="inline">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, rotateZ: -10 }}
          whileInView={{ opacity: 1, y: 0, rotateZ: 0 }}
          transition={{
            delay: delay + i * duration,
            duration: 0.3,
            type: "spring",
            stiffness: 100,
          }}
          viewport={{ once: false, margin: "-100px" }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}

/* ============= AMBIENT BACKGROUND MOTION ============= */
export function AmbientBackgroundMotion() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Primary floating orb */}
      <motion.div
        className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        animate={{
          x: [0, 100, -100, 0],
          y: [0, 150, -50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary floating orb */}
      <motion.div
        className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-secondary/20 blur-3xl"
        animate={{
          x: [0, -150, 100, 0],
          y: [0, 100, -100, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Tertiary floating orb */}
      <motion.div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -150, 50, 0],
          scale: [0.9, 1.1, 1, 0.9],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Animated mesh background */}
      <motion.div
        className="absolute inset-0 opacity-5"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 20, repeat: Infinity }}
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(255, 56, 92, 0.1) 35px,
            rgba(255, 56, 92, 0.1) 70px
          )`,
        }}
      />
    </div>
  );
}

/* ============= SELF-DRAWING ANIMATION ============= */
export function SelfDrawingSVG({
  children,
  duration = 3,
}: {
  children: React.ReactNode;
  duration?: number;
}) {
  return (
    <motion.svg
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      transition={{ duration, ease: "easeInOut" }}
      viewport={{ once: false, margin: "-50px" }}
      style={{ overflow: "visible" }}
    >
      {children}
    </motion.svg>
  );
}

export const DrawingPath = motion.path;

/* ============= MORPHING SHAPES ============= */
export function MorphingShape({
  shapes,
  duration = 2,
}: {
  shapes: string[];
  duration?: number;
}) {
  return (
    <motion.svg width="200" height="200" viewBox="0 0 200 200">
      <motion.path
        d={shapes[0]}
        animate={{ d: shapes }}
        transition={{ duration, repeat: Infinity, repeatType: "reverse" }}
        fill="currentColor"
        className="text-primary"
      />
    </motion.svg>
  );
}

/* ============= ANIMATED GRADIENT ============= */
export function AnimatedGradientBackground({
  colors = [
    "from-primary/20 to-secondary/20",
    "from-secondary/20 to-primary/20",
    "from-primary/10 to-primary/20",
  ],
}: {
  colors?: string[];
}) {
  const backgroundColors = colors.map((color) => `bg-gradient-to-br ${color}`);

  return (
    <motion.div
      className={`absolute inset-0 ${backgroundColors[0]} blur-3xl`}
      animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    />
  );
}

/* ============= GLASSMORPHISM ============= */
export function GlassmorphicCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={`rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl hover:bg-white/20 ${className}`}
      whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(255, 56, 92, 0.2)" }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      {children}
    </motion.div>
  );
}

/* ============= CLAYMORPHIC EFFECT ============= */
export function ClaymorphicButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative inline-flex flex-nowrap items-center rounded-3xl bg-gradient-to-br from-primary to-primary/80 px-8 py-3 text-white font-bold shadow-xl ${className}`}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 20px 40px rgba(59, 130, 246, 0.36), inset -2px -2px 5px rgba(255, 255, 255, 0.2)",
      }}
      whileTap={{
        scale: 0.95,
        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.2)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <span className="relative z-10 inline-flex items-center whitespace-nowrap">{children}</span>
      <motion.div
        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 to-transparent opacity-0"
        whileHover={{ opacity: 1 }}
      />
    </motion.button>
  );
}

/* ============= NEUMORPHIC EFFECT ============= */
export function NeumorphicCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={`rounded-3xl bg-gradient-to-br from-background to-background/80 ${className}`}
      style={{
        boxShadow:
          "8px 8px 16px rgba(0, 0, 0, 0.25), -8px -8px 16px rgba(255, 255, 255, 0.1)",
      }}
      whileHover={{
        boxShadow:
          "12px 12px 24px rgba(0, 0, 0, 0.3), -12px -12px 24px rgba(255, 255, 255, 0.15)",
      }}
    >
      {children}
    </motion.div>
  );
}

/* ============= LIQUID MOTION ============= */
export function LiquidButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const pathVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  return (
    <motion.button
      onClick={onClick}
      className="relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-3"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 200"
        variants={pathVariants}
        initial="hidden"
        whileHover="visible"
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 56, 92, 0.8)" />
            <stop offset="100%" stopColor="rgba(255, 126, 31, 0.8)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 50,50 Q 150,50 150,150 Q 150,150 50,150 Q 50,150 50,50"
          fill="url(#gradient)"
          animate={{
            d: [
              "M 50,50 Q 150,50 150,150 Q 150,150 50,150 Q 50,150 50,50",
              "M 50,50 Q 150,100 150,150 Q 100,150 50,150 Q 50,100 50,50",
              "M 50,50 Q 150,50 150,150 Q 150,150 50,150 Q 50,150 50,50",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
      <span className="relative z-10 font-bold text-white">{children}</span>
    </motion.button>
  );
}

/* ============= PAGE TRANSITION EFFECT ============= */
export function PageTransitionWrapper({
  children,
  variant = "fade",
}: {
  children: React.ReactNode;
  variant?: "fade" | "slideUp" | "zoomIn";
}) {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 50 },
    },
    zoomIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },
  };

  return (
    <motion.div
      initial={variants[variant].initial}
      animate={variants[variant].animate}
      exit={variants[variant].exit}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ============= ISOMETRIC ANIMATION ============= */
export function IsometricCard({
  children,
  depth = 20,
}: {
  children: React.ReactNode;
  depth?: number;
}) {
  return (
    <motion.div
      className="relative rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 p-6"
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
      whileHover={{
        rotateX: 5,
        rotateY: 5,
        y: -depth,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
      {/* Isometric shadow */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-20 rounded-b-lg bg-gradient-to-b from-black/20 to-transparent blur-lg"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
    </motion.div>
  );
}

/* ============= LOADING SKELETON ============= */
export function LoadingSkeleton({
  count = 4,
  variant = "card",
}: {
  count?: number;
  variant?: "card" | "text" | "avatar";
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${
            variant === "card"
              ? "h-64 rounded-lg"
              : variant === "avatar"
                ? "h-12 w-12 rounded-full"
                : "h-4 rounded"
          } bg-gradient-to-r from-muted via-muted/50 to-muted`}
          animate={{
            backgroundPosition: ["0%", "100%", "0%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            backgroundSize: "200% 100%",
          }}
        />
      ))}
    </>
  );
}

/* ============= INFINITE LOADING ANIMATION ============= */
export function InfiniteLoadingAnimation() {
  return (
    <motion.div className="flex justify-center items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-3 w-3 rounded-full bg-primary"
          animate={{
            y: [0, -20, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </motion.div>
  );
}

/* ============= HOVER MICRO-INTERACTIONS ============= */
export function HoverLiftCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={`rounded-xl bg-card p-6 ${className}`}
      whileHover={{
        y: -12,
        boxShadow: "0 30px 60px rgba(255, 56, 92, 0.25)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}

/* ============= TEXT REVEAL ANIMATION ============= */
export function TextReveal({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false, margin: "-50px" }}
      >
        {text}
      </motion.div>
      {/* Animated line */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary"
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: false, margin: "-50px" }}
      />
    </div>
  );
}

/* ============= STAGGERED LIST ANIMATION ============= */
export function StaggeredListAnimation({
  items = [],
  renderItem,
  children,
}: {
  items?: any[];
  renderItem?: (item: any) => React.ReactNode;
  children?: React.ReactNode;
}) {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-100px" }}
    >
      {children || (items && items.length > 0 ? items.map((i, idx) => (
        <motion.div key={idx} variants={item}>
          {renderItem?.(i)}
        </motion.div>
      )) : null)}
    </motion.div>
  );
}

/* ============= PARALLAX SCROLL EFFECT ============= */
export function ParallaxImage({
  src,
  speed = 0.5,
  alt = "Image",
}: {
  src: string;
  speed?: number;
  alt?: string;
}) {
  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{ y: 100 * speed }}
      transition={{ type: "spring", stiffness: 50, damping: 20 }}
      viewport={{ once: false, amount: 0.3 }}
      className="overflow-hidden rounded-lg"
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
    </motion.div>
  );
}

/* ============= NUMBER COUNTER ANIMATION ============= */
export function AnimatedCounter({
  from = 0,
  to = 100,
  duration = 2,
  suffix = "",
}: {
  from?: number;
  to?: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    const controls = setInterval(() => {
      setCount((prev) => {
        if (prev < to) {
          return Math.min(prev + Math.ceil((to - from) / (duration * 60)), to);
        }
        clearInterval(controls);
        return to;
      });
    }, 1000 / 60);

    return () => clearInterval(controls);
  }, [from, to, duration]);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {count}
      {suffix}
    </motion.span>
  );
}

/* ============= BOUNCE ANIMATION ============= */
export function BounceElement({
  children,
  intensity = 1,
}: {
  children: React.ReactNode;
  intensity?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -20 * intensity, 0] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

/* ============= ROTATION ANIMATION ============= */
export function RotatingElement({
  children,
  duration = 4,
}: {
  children: React.ReactNode;
  duration?: number;
}) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {children}
    </motion.div>
  );
}

/* ============= PULSE ANIMATION ============= */
export function PulseElement({
  children,
  intensity = 0.1,
}: {
  children: React.ReactNode;
  intensity?: number;
}) {
  return (
    <motion.div
      animate={{
        scale: [1, 1 + intensity, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

/* ============= BLUR IN/OUT ANIMATION ============= */
export function BlurReveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(20px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: false, margin: "-100px" }}
    >
      {children}
    </motion.div>
  );
}
