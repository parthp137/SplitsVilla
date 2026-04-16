import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Sparkles,
  ArrowRight,
  Shield,
  BarChart3,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Footer from "@/components/common/Footer";
import AnimatedPropertyCard from "@/components/property/AnimatedPropertyCard";
import { mockProperties, categoryIcons } from "@/utils/mockData";
import {
  AmbientBackgroundMotion,
  ScrollytellingSection,
  AnimatedTypography,
  GlassmorphicCard,
  ClaymorphicButton,
  LiquidButton,
  PageTransitionWrapper,
  BlurReveal,
  AnimatedCounter,
  BounceElement,
} from "@/components/effects/AdvancedAnimations";

export default function Landing() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("trending");
  const [scrollProgress, setScrollProgress] = useState(0);

  const getCategoryFiltered = (category: string) => {
    switch (category) {
      case "villas":
        return mockProperties.filter((p) => p.type === "villa");
      case "beach":
        return mockProperties.filter((p) =>
          [
            "Goa",
            "Kerala",
            "Alleppey",
            "Kochin",
            "Varkala",
            "Kumbalangi",
            "Diu",
            "Pondicherry",
            "Vembanad",
          ].includes(p.location.city)
        );
      case "mountains":
        return mockProperties.filter((p) =>
          [
            "Manali",
            "Ooty",
            "Shimla",
            "Dalhousie",
            "Mussoorie",
            "Kasauli",
            "Ladakh",
            "Leh",
            "Gulmarg",
            "Kodaikanal",
          ].includes(p.location.city)
        );
      case "trending":
        return mockProperties
          .filter((p) => p.isFeatured || p.rating >= 4.85)
          .sort((a, b) => b.rating - a.rating);
      case "city":
        return mockProperties.filter((p) =>
          [
            "Mumbai",
            "Delhi",
            "Bangalore",
            "Hyderabad",
            "Pune",
            "Chennai",
            "Kolkata",
            "Ahmedabad",
          ].includes(p.location.city)
        );
      case "budget":
        return mockProperties
          .filter((p) => p.pricePerNight < 5000)
          .sort((a, b) => a.pricePerNight - b.pricePerNight);
      case "luxury":
        return mockProperties
          .filter((p) => p.pricePerNight >= 10000)
          .sort((a, b) => b.pricePerNight - a.pricePerNight);
      case "pools":
        return mockProperties.filter((p) => p.amenities.includes("Pool"));
      case "countryside":
        return mockProperties.filter(
          (p) =>
            (p.type === "cottage" || p.type === "villa" || p.type === "resort") &&
            [
              "Coorg",
              "Mussoorie",
              "Ooty",
              "Dalhousie",
              "Kodaikanal",
              "Tehri",
              "Kumaon",
              "Shimla",
            ].includes(p.location.city)
        );
      case "new":
        return mockProperties
          .filter((p) => {
            const createdDate = new Date(p.createdAt);
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            return createdDate > threeMonthsAgo;
          })
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      default:
        return mockProperties;
    }
  };

  const filteredProperties = getCategoryFiltered(activeCategory);

  return (
    <PageTransitionWrapper>
      <div className="relative min-h-screen overflow-hidden bg-background">
        {/* GLOBAL ANIMATED BACKGROUND */}
        <div className="fixed inset-0 -z-10">
          <AmbientBackgroundMotion />

          {/* Animated gradient mesh */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                "radial-gradient(ellipse at 0% 0%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)",
                "radial-gradient(ellipse at 100% 100%, rgba(250, 204, 21, 0.15) 0%, transparent 50%)",
                "radial-gradient(ellipse at 0% 0%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          {/* Animated grid lines */}
          <svg className="absolute inset-0 h-full w-full opacity-5">
            <defs>
              <pattern
                id="grid"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <motion.path
                  d="M 100 0 L 0 0 0 100"
                  stroke="rgba(249, 115, 22, 0.5)"
                  strokeWidth="1"
                  animate={{
                    opacity: [0.2, 0.6, 0.2],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* HERO - REDESIGNED WITH BETTER BACKGROUND */}
        <section className="relative overflow-hidden">
          {/* Premium background image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop"
              alt="DreamTravel"
              className="h-full w-full object-cover"
            />
            {/* Gradient overlays for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/50" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
          </div>

          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
              animate={{
                y: [0, 40, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 20, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-secondary/10 blur-3xl"
              animate={{
                y: [0, -50, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{ duration: 25, repeat: Infinity }}
            />
          </div>

          {/* Content */}
          <div className="relative mx-auto max-w-6xl px-4 py-32 sm:px-6 lg:px-8 lg:py-40">
            {/* SplitsVilla Badge - Prominent */}
            <motion.div
              className="mb-8 inline-flex items-center gap-3 rounded-2xl border border-primary/60 bg-primary/25 px-6 py-3 backdrop-blur-lg shadow-2xl"
              initial={{ opacity: 0, y: -30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, type: "spring" }}
            >
              <motion.span
                className="text-3xl"
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                🌴
              </motion.span>
              <div className="flex flex-col">
                <span className="text-lg font-black text-white">SplitsVilla</span>
                <span className="text-xs font-semibold text-orange-300">Where Memories Meet Savings</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              className="mb-6 max-w-3xl text-5xl sm:text-6xl lg:text-7xl font-black leading-tight text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                textShadow: "0 4px 20px rgba(0,0,0,0.9), 0 0 40px rgba(249, 115, 22, 0.3)",
              }}
            >
              Travel Together,{" "}
              <motion.span
                className="block text-transparent bg-gradient-to-r from-yellow-200 via-orange-300 to-orange-500 bg-clip-text py-2"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.4, type: "spring" }}
              >
                Split Smarter ✨
              </motion.span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              className="mb-10 max-w-2xl text-lg sm:text-xl text-white/95 font-semibold leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{
                textShadow: "0 2px 10px rgba(0,0,0,0.8)",
              }}
            >
              🏝️ Plan incredible group vacations | 🏠 Find premium stays together | 💰 Split expenses fairly
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="mb-12 flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <LiquidButton 
                onClick={() => navigate("/search")}
                className="px-8 py-4 text-base font-bold"
              >
                <Search className="mr-2 h-5 w-5" />
                Explore Properties
              </LiquidButton>
              <ClaymorphicButton 
                onClick={() => navigate("/dashboard/trips/create")}
                className="px-8 py-4 text-base font-bold"
              >
                <Users className="mr-2 h-5 w-5" />
                Start Planing Now
              </ClaymorphicButton>
            </motion.div>

            {/* Trust Section */}
            <motion.div
              className="flex items-center gap-4 text-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-primary to-secondary shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                  />
                ))}
              </div>
              <div>
                <div className="font-bold text-white">10,000+ Happy Travelers</div>
                <div className="text-sm text-orange-300">Already splitting smarter with SplitsVilla 🎉</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SCROLLYTELLING STATS */}
        <ScrollytellingSection onScroll={setScrollProgress}>
          <section className="relative py-20">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              <motion.div
                className="grid gap-8 md:grid-cols-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: "-100px" }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.15 },
                  },
                }}
              >
                {[
                  { label: "Group Trips", value: 50000, suffix: "+" },
                  { label: "Cost Saved", value: 100, suffix: "M INR" },
                  { label: "Happy Travelers", value: 250000, suffix: "+" },
                  { label: "Countries", value: 15, suffix: "" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    variants={{
                      hidden: { opacity: 0, scale: 0.5 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                    className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 p-8 text-center backdrop-blur-sm"
                  >
                    <motion.div
                      className="text-4xl font-black text-primary"
                      style={{
                        opacity: Math.max(0, scrollProgress - i * 0.1),
                      }}
                    >
                      <AnimatedCounter
                        from={0}
                        to={stat.value}
                        duration={2}
                        suffix={stat.suffix}
                      />
                    </motion.div>
                    <p className="mt-2 text-sm font-semibold text-muted-foreground">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        </ScrollytellingSection>

        {/* CATEGORY STRIP - GLASSMORPHISM */}
        <section className="sticky top-16 z-30 border-b border-primary/20 backdrop-blur-3xl lg:top-20">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-background via-primary/5 to-background"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{ duration: 15, repeat: Infinity }}
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <motion.div
              className="flex gap-3 overflow-x-auto py-4 scrollbar-hide md:gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
            >
              {categoryIcons.map((cat) => (
                <motion.button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`relative flex shrink-0 flex-col items-center gap-2 rounded-2xl px-4 py-2.5 transition-all ${
                    activeCategory === cat.key
                      ? "bg-primary/40 text-card"
                      : "text-muted-foreground hover:bg-primary/20 hover:text-card"
                  }`}
                  variants={{
                    hidden: { opacity: 0, scale: 0.5, y: -20 },
                    visible: { opacity: 1, scale: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  whileTap={{ scale: 0.85 }}
                >
                  {activeCategory === cat.key && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/50 to-secondary/30 blur-lg -z-10"
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(255, 56, 92, 0.4)",
                          "0 0 40px rgba(255, 56, 92, 0.6)",
                          "0 0 20px rgba(255, 56, 92, 0.4)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  <motion.span
                    className="relative z-10 text-2xl"
                    animate={
                      activeCategory === cat.key
                        ? { rotate: 360, scale: 1.2 }
                        : { rotate: 0, scale: 1 }
                    }
                    transition={{ duration: 0.6 }}
                  >
                    {cat.icon}
                  </motion.span>

                  <span className="relative z-10 text-xs font-bold">
                    {cat.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* PROPERTY GRID */}
        <section className="relative overflow-hidden py-20">
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-secondary/5"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <BlurReveal>
              <h2 className="font-heading text-4xl font-black text-foreground">
                🔥{" "}
                {activeCategory === "trending"
                  ? "Trending Now"
                  : categoryIcons.find((c) => c.key === activeCategory)
                      ?.label || "Properties"}
              </h2>
            </BlurReveal>

            <motion.div
              className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              {filteredProperties.slice(0, 8).map((property, idx) => (
                <AnimatedPropertyCard
                  key={property.id}
                  property={property}
                  groupSize={4}
                  showPerPerson
                  index={idx}
                />
              ))}
            </motion.div>

            {/* View All button */}
            <motion.div className="mt-12 flex justify-center" whileHover={{ scale: 1.05 }}>
              <ClaymorphicButton
                onClick={() => {
                  const params = new URLSearchParams();
                  if (activeCategory !== "trending") {
                    params.append("category", activeCategory);
                  }
                  navigate(
                    `/search${params.toString() ? "?" + params.toString() : ""}`
                  );
                }}
              >
                View All Properties <ArrowRight className="ml-2 h-5 w-5" />
              </ClaymorphicButton>
            </motion.div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="relative py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <motion.h2
              className="text-center font-heading text-4xl font-black text-foreground"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: false, margin: "-100px" }}
            >
              Why Choose<span className="text-primary"> SplitsVilla</span>?
            </motion.h2>

            <motion.div
              className="mt-16 grid gap-8 md:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2 },
                },
              }}
            >
              {[
                {
                  icon: Users,
                  title: "Smart Group Planning",
                  desc: "Collaborate in real-time with your friends.",
                },
                {
                  icon: BarChart3,
                  title: "Fair Cost Splitting",
                  desc: "Automatic expense tracking and settlement.",
                },
                {
                  icon: Zap,
                  title: "Best Deal Guarantee",
                  desc: "AI-powered property recommendations.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={{
                    hidden: { opacity: 0, y: 30, rotateX: -20 },
                    visible: { opacity: 1, y: 0, rotateX: 0 },
                  }}
                  whileHover={{
                    scale: 1.08,
                    rotateY: 10,
                  }}
                  className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-primary/5 p-10 backdrop-blur-3xl"
                >
                  <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/40 to-secondary/40"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="mt-4 font-heading text-xl font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="relative py-20">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-background to-secondary/10"
            animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
            transition={{ duration: 15, repeat: Infinity }}
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <motion.h2
              className="text-center font-heading text-4xl font-black text-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: false, margin: "-100px" }}
            >
              How It Works
            </motion.h2>

            <motion.div
              className="mt-16 grid gap-6 md:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
              }}
            >
              {[
                { step: "01", title: "Create Trip", desc: "Set dates & budget" },
                { step: "02", title: "Invite Friends", desc: "Share invite code" },
                { step: "03", title: "Vote & Decide", desc: "Choose together" },
                { step: "04", title: "Book & Split", desc: "Pay fairly" },
              ].map(({ step, title, desc }, idx) => (
                <motion.div
                  key={step}
                  variants={{
                    hidden: { opacity: 0, x: idx % 2 === 0 ? -40 : 40 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0 20px 50px rgba(255, 56, 92, 0.3)",
                  }}
                  className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 to-transparent p-8 backdrop-blur-lg"
                >
                  <motion.div
                    className="text-5xl font-black text-primary/60"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: idx * 0.2,
                    }}
                  >
                    {step}
                  </motion.div>
                  <h3 className="mt-4 font-heading text-xl font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="relative overflow-hidden py-20">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
            <motion.div
              className="rounded-4xl border border-white/20 bg-gradient-to-br from-white/5 to-primary/10 p-12 text-center backdrop-blur-3xl"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false, margin: "-100px" }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="mx-auto h-12 w-12 text-primary" />
              </motion.div>

              <h2 className="mt-4 font-heading text-4xl font-black text-foreground">
                Ready to Split Smart?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of travelers who split costs fairly and travel
                smarter.
              </p>

              <motion.div
                className="mt-8 flex flex-col justify-center gap-4 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <ClaymorphicButton onClick={() => navigate("/register")}>
                  Get Started Free
                </ClaymorphicButton>

                <motion.button
                  onClick={() => navigate("/search")}
                  className="rounded-full border-2 border-white/30 px-8 py-3 font-bold text-card backdrop-blur-md hover:bg-white/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Properties
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransitionWrapper>
  );
}
