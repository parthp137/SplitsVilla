import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bath,
  BedDouble,
  Building2,
  CalendarClock,
  CheckCircle2,
  Coins,
  Home,
  MapPin,
  Phone,
  Plus,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AnimatedCounter,
  BlurReveal,
  PageTransitionWrapper,
  AmbientBackgroundMotion,
} from "@/components/effects/AdvancedAnimations";
import { BecomeHostSchema, type BecomeHostFormData } from "@/lib/validationSchemas";

const HOST_DRAFT_KEY = "sv_host_draft";

const hostSteps = [
  {
    number: "01",
    title: "List your space",
    description: "Share the essentials: property type, location, capacity, and the best parts of your stay.",
    icon: Home,
  },
  {
    number: "02",
    title: "Set pricing and rules",
    description: "Choose your nightly rate, guest limit, and hosting rules so everything stays clear.",
    icon: Coins,
  },
  {
    number: "03",
    title: "Review and activate",
    description: "Check the preview, confirm the details, and switch your profile into host mode.",
    icon: BadgeCheck,
  },
  {
    number: "04",
    title: "Start earning",
    description: "Accept bookings, manage requests, and track your revenue from one clean dashboard.",
    icon: Rocket,
  },
];

const valueProps = [
  {
    icon: Shield,
    title: "Trusted setup",
    description: "Capture the right details once, then keep the onboarding flow easy to review and edit.",
  },
  {
    icon: Sparkles,
    title: "Premium presentation",
    description: "The host page should feel polished, calm, and aligned with the dashboard styling.",
  },
  {
    icon: Star,
    title: "Built for conversion",
    description: "Show the value, show the steps, then let the form do the heavy lifting.",
  },
];

const propertyTypes = ["villa", "apartment", "hotel", "hostel", "resort", "cottage"] as const;

const defaultValues: BecomeHostFormData = {
  hostName: "",
  email: "",
  phone: "",
  propertyTitle: "",
  propertyType: "villa",
  address: "",
  city: "",
  country: "India",
  nightlyPrice: 25000,
  maxGuests: 8,
  bedrooms: 4,
  bathrooms: 4,
  description: "",
  amenities: "",
  imageUrls: "",
  checkInTime: "14:00",
  checkOutTime: "11:00",
  allowSmoking: false,
  allowPets: true,
  allowParties: false,
  termsAccepted: false,
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs font-medium text-destructive">{message}</p>;
}

export default function BecomeAHost() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BecomeHostFormData>({
    resolver: zodResolver(BecomeHostSchema),
    mode: "onBlur",
    defaultValues,
  });

  useEffect(() => {
    const draft = window.localStorage.getItem(HOST_DRAFT_KEY);
    const parsedDraft = draft ? (JSON.parse(draft) as Partial<BecomeHostFormData>) : {};
    setHasSavedDraft(Boolean(draft));

    reset({
      ...defaultValues,
      ...parsedDraft,
      hostName: user?.name || parsedDraft.hostName || defaultValues.hostName,
      email: user?.email || parsedDraft.email || defaultValues.email,
    });
  }, [reset, user]);

  const values = watch();

  const preview = useMemo(() => {
    const parsedImageUrls = values.imageUrls
      ? values.imageUrls
          .split(/[\n,]/)
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const nightlyPrice = Number(values.nightlyPrice || 0);
    const maxGuests = Number(values.maxGuests || defaultValues.maxGuests);
    const bedrooms = Number(values.bedrooms || defaultValues.bedrooms);
    const imageCount = parsedImageUrls.length;

    return {
      title: values.propertyTitle || "Sunset Ridge Villa",
      city: values.city || "Goa",
      type: values.propertyType || "villa",
      nightlyPrice,
      maxGuests,
      bedrooms,
      imageCount,
      firstImageUrl: parsedImageUrls[0] || "",
      monthlyEstimate: Math.max(0, nightlyPrice * 12),
    };
  }, [values]);

  useEffect(() => {
    const subscription = watch((currentValues) => {
      window.localStorage.setItem(HOST_DRAFT_KEY, JSON.stringify(currentValues));
      setHasSavedDraft(true);
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: BecomeHostFormData) => {
    window.localStorage.setItem(HOST_DRAFT_KEY, JSON.stringify(data));

    if (!isAuthenticated) {
      toast({
        title: "Host setup saved",
        description: "Create an account to continue and publish your listing setup.",
      });
      navigate("/register");
      return;
    }

    try {
      if (user?.role === "guest") {
        await updateProfile({ role: "host" });
      }

      toast({
        title: "Host mode ready",
        description: "Your profile is set for hosting. Continue to the host dashboard next.",
      });
      navigate("/host");
    } catch (error) {
      toast({
        title: "Could not enable host mode",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const scrollToPreview = () => {
    const previewElement = document.getElementById("host-preview");
    if (!previewElement) {
      return;
    }

    previewElement.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const shouldShowPreview = isDirty || hasSavedDraft;

  return (
    <PageTransitionWrapper>
      <div className="relative min-h-screen overflow-hidden bg-background">
        <div className="fixed inset-0 -z-10">
          <AmbientBackgroundMotion />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.12),transparent_36%)]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
          <div
            className={`grid gap-10 lg:items-start ${
              shouldShowPreview ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,420px)]" : "lg:grid-cols-1"
            }`}
          >
            <div className="space-y-10">
              <section className="rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-card backdrop-blur-xl lg:p-8">
                <BlurReveal>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">Become a Host</p>
                </BlurReveal>
                <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Turn your property into a polished hosting experience.
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Keep the flow clean: show the steps, preview the listing, and collect the property plus host details in one place.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="w-full rounded-full px-6 py-6 text-base font-semibold sm:w-auto">
                    <a href="#host-form">
                      Start setup
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-full px-6 py-6 text-base font-semibold sm:w-auto">
                    <a href="#host-steps">
                      View hosting steps
                    </a>
                  </Button>
                </div>
              </section>

              <section id="host-steps" className="space-y-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">How hosting works</p>
                    <h2 className="mt-2 font-heading text-3xl font-extrabold text-foreground">Four simple steps</h2>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {hostSteps.map((step, index) => {
                    const Icon = step.icon;

                    return (
                      <motion.div
                        key={step.number}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, margin: "-80px" }}
                        transition={{ duration: 0.45, delay: index * 0.06 }}
                        className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/5 p-5 shadow-card"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-[0.32em] text-primary">Step {step.number}</span>
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-3">
                {valueProps.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, margin: "-80px" }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className="rounded-3xl border border-border/70 bg-card/85 p-5 shadow-card backdrop-blur"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </motion.div>
                  );
                })}
              </section>

            </div>

            {shouldShowPreview && <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <motion.div
                id="host-preview"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 shadow-card backdrop-blur-xl"
              >
                <div className="relative h-72 overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-secondary p-6 text-primary-foreground">
                  {preview.firstImageUrl && (
                    <img
                      src={preview.firstImageUrl}
                      alt="Property draft preview"
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,23,42,0.78),rgba(15,23,42,0.25)),radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_28%)]" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em]">
                        Your draft preview
                      </div>
                      <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                        {preview.imageCount} images
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-primary-foreground/90">{preview.type.toUpperCase()}</p>
                      <h2 className="mt-2 font-heading text-3xl font-extrabold leading-tight text-primary-foreground">
                        {preview.title}
                      </h2>
                      <div className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/90">
                        <MapPin className="h-4 w-4" />
                        {preview.city}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/5 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">Estimated monthly earnings</p>
                    <div className="mt-3 flex items-end gap-2">
                      <span className="text-xl font-semibold text-foreground">₹</span>
                      <AnimatedCounter from={0} to={preview.monthlyEstimate || 0} duration={1.8} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Based on {preview.nightlyPrice ? formatCurrency(preview.nightlyPrice) : "a nightly rate"} and around 12 booked nights.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    {[
                      { label: "Guests", value: preview.maxGuests, icon: Users },
                      { label: "Bedrooms", value: preview.bedrooms, icon: BedDouble },
                      { label: "Bathrooms", value: preview.bedrooms > 0 ? Math.max(1, Math.round(preview.bedrooms / 2)) : 1, icon: Bath },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <div key={item.label} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{item.label}</span>
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <p className="mt-2 font-heading text-2xl font-extrabold text-foreground">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                    <p className="text-sm font-semibold text-foreground">What you’ll need next</p>
                    <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        Availability and check-in windows.
                      </li>
                      <li className="flex items-start gap-3">
                        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        House rules and hosting preferences.
                      </li>
                      <li className="flex items-start gap-3">
                        <Plus className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        A few clear images or image URLs for the first draft.
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                    <p className="text-sm font-semibold text-foreground">Quick summary</p>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between gap-4">
                        <span>Property type</span>
                        <span className="font-semibold text-foreground">{preview.type}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Address</span>
                        <span className="max-w-[55%] truncate font-semibold text-foreground">{values.address || "Add your address"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Host contact</span>
                        <span className="max-w-[55%] truncate font-semibold text-foreground">{values.email || "your email"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </aside>}
          </div>

          <section id="host-form" className="mx-auto mt-10 w-full max-w-4xl rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-card backdrop-blur-xl lg:p-8">
            <div className="mx-auto w-full max-w-3xl">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Host setup form</p>
                  <h2 className="mt-2 font-heading text-3xl font-extrabold text-foreground">Share your property details</h2>
                </div>
                <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  Drafts save automatically on this device
                </div>
              </div>

              <form className="mt-8 space-y-8" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-5 rounded-3xl border border-border/70 bg-background/60 p-5">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="font-heading text-lg font-bold text-foreground">Host details</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Full name</label>
                      <Input placeholder="Your name" {...register("hostName")} />
                      <FieldError message={errors.hostName?.message} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Email address</label>
                      <Input type="email" placeholder="you@example.com" {...register("email")} />
                      <FieldError message={errors.email?.message} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Phone number</label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-10" placeholder="+91 98765 43210" {...register("phone")} />
                      </div>
                      <FieldError message={errors.phone?.message} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Country</label>
                      <Input placeholder="India" {...register("country")} />
                      <FieldError message={errors.country?.message} />
                    </div>
                  </div>
                </div>

                <div className="space-y-5 rounded-3xl border border-border/70 bg-background/60 p-5">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h3 className="font-heading text-lg font-bold text-foreground">Property details</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Property title</label>
                      <Input placeholder="e.g. Cliffside Sea View Villa" {...register("propertyTitle")} />
                      <FieldError message={errors.propertyTitle?.message} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Property type</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        {...register("propertyType")}
                      >
                        {propertyTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                      <FieldError message={errors.propertyType?.message} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Nightly price (₹)</label>
                      <Input type="number" min={1} {...register("nightlyPrice")} />
                      <FieldError message={errors.nightlyPrice?.message} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Max guests</label>
                      <Input type="number" min={1} max={20} {...register("maxGuests")} />
                      <FieldError message={errors.maxGuests?.message} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Bedrooms</label>
                      <Input type="number" min={0} max={20} {...register("bedrooms")} />
                      <FieldError message={errors.bedrooms?.message} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Bathrooms</label>
                      <Input type="number" min={0} max={20} {...register("bathrooms")} />
                      <FieldError message={errors.bathrooms?.message} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Address</label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-10" placeholder="Full street address" {...register("address")} />
                      </div>
                      <FieldError message={errors.address?.message} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">City</label>
                      <Input placeholder="Goa" {...register("city")} />
                      <FieldError message={errors.city?.message} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Check-in time</label>
                      <Input type="time" {...register("checkInTime")} />
                      <FieldError message={errors.checkInTime?.message} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Check-out time</label>
                      <Input type="time" {...register("checkOutTime")} />
                      <FieldError message={errors.checkOutTime?.message} />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
                    <Textarea rows={5} placeholder="Describe the space, surroundings, and what guests can expect." {...register("description")} />
                    <FieldError message={errors.description?.message} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Amenities</label>
                      <Textarea rows={4} placeholder="Pool, Wi-Fi, parking, chef, terrace..." {...register("amenities")} />
                      <p className="mt-1 text-xs text-muted-foreground">Separate items with commas.</p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Image URLs</label>
                      <Textarea rows={4} placeholder="Paste one URL per line or comma-separated." {...register("imageUrls")} />
                      <p className="mt-1 text-xs text-muted-foreground">Start with URLs now; upload support can come later.</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Controller
                      control={control}
                      name="allowSmoking"
                      render={({ field }) => (
                        <label className="flex items-start gap-3 rounded-2xl border border-border bg-card/70 p-4">
                          <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                          <span>
                            <span className="block text-sm font-semibold text-foreground">Smoking allowed</span>
                            <span className="block text-xs text-muted-foreground">Make the rule explicit.</span>
                          </span>
                        </label>
                      )}
                    />
                    <Controller
                      control={control}
                      name="allowPets"
                      render={({ field }) => (
                        <label className="flex items-start gap-3 rounded-2xl border border-border bg-card/70 p-4">
                          <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                          <span>
                            <span className="block text-sm font-semibold text-foreground">Pets allowed</span>
                            <span className="block text-xs text-muted-foreground">Useful for family-style stays.</span>
                          </span>
                        </label>
                      )}
                    />
                    <Controller
                      control={control}
                      name="allowParties"
                      render={({ field }) => (
                        <label className="flex items-start gap-3 rounded-2xl border border-border bg-card/70 p-4">
                          <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                          <span>
                            <span className="block text-sm font-semibold text-foreground">Parties allowed</span>
                            <span className="block text-xs text-muted-foreground">Set expectations from day one.</span>
                          </span>
                        </label>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-5 rounded-3xl border border-border/70 bg-background/60 p-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <h3 className="font-heading text-lg font-bold text-foreground">Final confirmation</h3>
                  </div>

                  <Controller
                    control={control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <label className="flex items-start gap-3 rounded-2xl border border-border bg-card/70 p-4">
                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                        <span className="text-sm text-muted-foreground">
                          I confirm that the details I provide are accurate and I agree to the host listing terms.
                        </span>
                      </label>
                    )}
                  />
                  <FieldError message={errors.termsAccepted?.message} />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={scrollToPreview}
                      disabled={!shouldShowPreview}
                      className="w-full rounded-full py-6 text-base font-semibold"
                    >
                      Check preview
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="w-full rounded-full py-6 text-base font-semibold">
                      {isSubmitting
                        ? "Saving setup..."
                        : isAuthenticated
                          ? "Continue to host dashboard"
                          : "Continue to create account"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </PageTransitionWrapper>
  );
}