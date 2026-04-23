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
import { useAuth } from "@/contexts/AuthContext";
import { mockProperties, categoryIcons } from "@/utils/mockData";
import {
  AmbientBackgroundMotion,
  ScrollytellingSection,
  AnimatedTypography,
  GlassmorphicCard,
  ClaymorphicButton,
  PageTransitionWrapper,
  BlurReveal,
  AnimatedCounter,
  BounceElement,
} from "@/components/effects/AdvancedAnimations";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
        <section className="relative min-h-[88svh] overflow-hidden sm:min-h-[92vh] lg:min-h-screen">
          {/* Premium background image */}
          <div className="absolute inset-0 z-0 sm:fixed">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop"
              alt="DreamTravel"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Animated background elements */}
          <div className="absolute inset-0 z-10 hidden overflow-hidden sm:block">
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
          <div className="relative z-20 mx-auto flex min-h-[88svh] max-w-6xl flex-col justify-center px-4 py-16 sm:min-h-[92vh] sm:px-6 lg:min-h-screen lg:px-8 lg:py-32">
            <motion.h2
              className="-mt-4 mb-8 text-3xl text-slate-950 sm:mb-10 sm:text-6xl"
              style={{ fontFamily: '"Segoe Script", "Lucida Handwriting", cursive' }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Splits<span className="text-primary">Villa</span>
            </motion.h2>

            {/* Main Headline */}
            <motion.h1
              className="mb-6 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                textShadow: "0 2px 10px rgba(255,255,255,0.35)",
              }}
            >
              Travel Together,{" "}
              <motion.span
                className="block bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text py-2 text-transparent"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.4, type: "spring" }}
              >
                Split Smarter ✦
              </motion.span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              className="mb-8 max-w-2xl whitespace-normal text-base font-bold leading-relaxed text-slate-800 sm:mb-10 sm:max-w-none sm:whitespace-nowrap sm:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{
                textShadow: "0 1px 6px rgba(255,255,255,0.4)",
              }}
            >
              Plan incredible group vacations | Find premium stays together | Split expenses fairly
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <ClaymorphicButton
                className="w-full justify-center sm:w-auto"
                onClick={() => navigate("/search")}
              >
                <Search className="mr-2 h-5 w-5" />
                Explore Properties
              </ClaymorphicButton>
              <ClaymorphicButton
                className="w-full justify-center sm:w-auto"
                onClick={() => navigate("/dashboard/trips/create")}
              >
                <Users className="mr-2 h-5 w-5" />
                Start Planing Now
              </ClaymorphicButton>
              <ClaymorphicButton
                className="w-full justify-center sm:w-auto"
                onClick={() => navigate("/become-host")}
              >
                <Shield className="mr-2 h-5 w-5" />
                Become a Host
              </ClaymorphicButton>
            </motion.div>

            {/* Trust Section */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-3 text-center text-slate-800 sm:justify-start sm:gap-4 sm:text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-slate-200 bg-gradient-to-br from-slate-600 to-slate-300 shadow-lg sm:h-10 sm:w-10"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                  />
                ))}
              </div>
              <div>
                <div className="font-bold text-slate-950">10,000+ Happy Travelers</div>
                <div className="text-sm text-slate-700">Already splitting smarter with SplitsVilla ◌</div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="relative z-30 bg-black">

        {/* SCROLLYTELLING STATS */}
        <ScrollytellingSection onScroll={setScrollProgress}>
          <section className="relative py-14 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              <motion.div
                className="grid gap-4 sm:gap-6 md:grid-cols-4"
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
                    className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 p-5 text-center backdrop-blur-sm sm:p-8"
                  >
                    <motion.div
                      className="text-3xl font-black text-white sm:text-4xl"
                      whileInView={{ scale: 1 }}
                      initial={{ scale: 1 }}
                      viewport={{ once: false, margin: "-50px" }}
                      style={{
                        opacity: 1,
                      }}
                    >
                      <AnimatedCounter
                        from={0}
                        to={stat.value}
                        duration={2}
                        suffix={stat.suffix}
                      />
                    </motion.div>
                    <p className="mt-2 text-xs font-semibold text-slate-700 sm:text-sm">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        </ScrollytellingSection>

        {/* CATEGORY STRIP - GLASSMORPHISM */}
        <section className="sticky top-14 z-30 border-b border-primary/20 backdrop-blur-3xl lg:top-20">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-background via-primary/5 to-background"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{ duration: 15, repeat: Infinity }}
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <motion.div
              className="flex justify-start gap-3 overflow-x-auto py-3 scrollbar-hide sm:justify-center sm:py-4 md:gap-4"
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
                  className={`relative flex shrink-0 flex-col items-center gap-2 rounded-2xl px-3 py-2 text-sm transition-all sm:px-4 sm:py-2.5 sm:text-base ${
                    activeCategory === cat.key
                      ? "bg-primary/40 text-card"
                      : "text-muted-foreground hover:bg-primary/20 hover:text-card"
                  }`}
                  variants={{
                    hidden: { opacity: 0, scale: 0.5, y: -20 },
                    visible: { opacity: 1, scale: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.85 }}
                >
                  {activeCategory === cat.key && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-2xl bg-primary/25 blur-lg -z-10 shadow-[0_0_20px_rgba(255,56,92,0.25)]"
                    />
                  )}

                  <motion.span
                    className="relative z-10 text-2xl"
                    animate={
                      activeCategory === cat.key
                        ? { scale: 1.05 }
                        : { scale: 1 }
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
              <h2 className="font-heading text-3xl font-black text-foreground sm:text-4xl">
                ✦{" "}
                {activeCategory === "trending"
                  ? "Trending Now"
                  : categoryIcons.find((c) => c.key === activeCategory)
                      ?.label || "Properties"}
              </h2>
            </BlurReveal>

            <motion.div
              className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
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
        <section className="relative py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <motion.h2
              className="text-center font-heading text-3xl font-black text-foreground sm:text-4xl"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: false, margin: "-100px" }}
            >
              Why Choose<span className="text-primary"> SplitsVilla</span>?
            </motion.h2>

            <motion.div
              className="mt-10 grid gap-4 sm:mt-16 sm:gap-8 md:grid-cols-3"
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
                  className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-primary/5 p-6 backdrop-blur-3xl sm:p-10"
                >
                  <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/40 to-secondary/40"
                    whileHover={{ scale: 1.2 }}
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
        <section className="relative py-14 sm:py-20">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-background to-secondary/10"
            animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
            transition={{ duration: 15, repeat: Infinity }}
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <motion.h2
              className="text-center font-heading text-3xl font-black text-foreground sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: false, margin: "-100px" }}
            >
              How It Works
            </motion.h2>

            <motion.div
              className="mt-10 grid gap-4 sm:mt-16 sm:gap-6 md:grid-cols-4"
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
                    boxShadow: "0 20px 50px rgba(59, 130, 246, 0.28)",
                  }}
                  className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 to-transparent p-6 backdrop-blur-lg sm:p-8"
                >
                  <div className="text-5xl font-black text-primary/60">
                    {step}
                  </div>
                  <h3 className="mt-4 font-heading text-xl font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {!isAuthenticated && (
          <>
            {/* CTA SECTION */}
            <section className="relative overflow-hidden py-14 sm:py-20">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{ duration: 10, repeat: Infinity }}
              />

              <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
                <motion.div
                  className="rounded-4xl border border-white/20 bg-gradient-to-br from-white/5 to-primary/10 p-6 text-center backdrop-blur-3xl sm:p-12"
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

                  <h2 className="mt-4 font-heading text-3xl font-black text-foreground sm:text-4xl">
                    Ready to Split Smart?
                  </h2>
                  <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                    Join thousands of travelers who split costs fairly and travel
                    smarter.
                  </p>

                  <motion.div
                    className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <ClaymorphicButton className="w-full justify-center sm:w-auto" onClick={() => navigate("/register")}>
                      Get Started Free
                    </ClaymorphicButton>

                    <motion.button
                      onClick={() => navigate("/search")}
                      className="w-full rounded-full border-2 border-white/30 px-8 py-3 font-bold text-card backdrop-blur-md hover:bg-white/10 sm:w-auto"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Explore Properties
                    </motion.button>
                  </motion.div>
                </motion.div>
              </div>
            </section>
          </>
        )}

        <Footer />
        </div>
      </div>
    </PageTransitionWrapper>
  );
}
