import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, Check } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { RegisterSchema } from "@/lib/validationSchemas";

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState("guest");

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(RegisterSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    }
  });

  const password = watch("password");

  const handleRegisterSubmit = async (data: any) => {
    try {
      console.log("📝 Registering with:", { name: data.name, email: data.email, role });
      await registerUser({ name: data.name, email: data.email, password: data.password, role });
      toast({ title: "Account created! 🎉" });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      toast({ 
        title: "Registration failed",
        description: error?.message || error?.toString() || "Could not create account. Check network connection.",
        variant: "destructive" 
      });
    }
  };

  const roles = [
    { value: "guest", label: "I want to travel", icon: "✈️" },
    { value: "host", label: "I want to host", icon: "🏡" },
    { value: "both", label: "Both", icon: "🌟" },
  ];

  const passwordStrengthChecks = [
    { met: password?.length >= 8, label: "At least 8 characters" },
    { met: /[A-Z]/.test(password || ""), label: "Uppercase letter" },
    { met: /[a-z]/.test(password || ""), label: "Lowercase letter" },
    { met: /[0-9]/.test(password || ""), label: "Number" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="relative hidden lg:flex lg:w-[56%] lg:flex-col lg:justify-between lg:overflow-hidden lg:p-12 xl:w-[58%]">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop"
          alt="SplitsVilla travel"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <Link to="/" className="relative z-10 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 shadow-sm backdrop-blur-sm">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span
            className="text-3xl text-white"
            style={{ fontFamily: '"Segoe Script", "Lucida Handwriting", cursive' }}
          >
            Splits<span className="text-primary">Villa</span>
          </span>
        </Link>
        <div className="relative z-10">
          <h2 className="font-heading text-4xl font-extrabold leading-tight text-white">
            Join the smartest<br />way to travel.
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {["Plan Together", "Track Expenses", "AI Estimates"].map((t) => (
              <span key={t} className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-sm">{t}</span>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-sm text-white/75">© 2026 SplitsVilla, Inc.</p>
      </div>

      {/* Right form */}
      <div className="flex w-full items-center justify-center bg-card p-8 lg:w-[44%] xl:w-[42%]">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-extrabold text-foreground">SplitsVilla</span>
          </Link>
          <h1 className="font-heading text-3xl font-extrabold text-foreground">Create your account</h1>
          <p className="mt-2 text-muted-foreground">Start planning smarter group trips</p>

          <form onSubmit={handleSubmit(handleRegisterSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Your name" 
                  className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  type="email"
                  placeholder="you@example.com" 
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  type={showPw ? "text" : "password"} 
                  placeholder="••••••••"
                  className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                  {...register("password")}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1.5">
                  {passwordStrengthChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {check.met ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                      )}
                      <span className={check.met ? "text-foreground" : "text-muted-foreground"}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {errors.password && (
                <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  type={showConfirm ? "text" : "password"} 
                  placeholder="••••••••"
                  className={`pl-10 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                  {...register("confirmPassword")}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">I want to...</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`rounded-xl border-2 p-3 text-center transition-colors ${
                      role === r.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <span className="text-xl">{r.icon}</span>
                    <p className="mt-1 text-xs font-medium text-foreground">{r.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Controller
                name="agreeToTerms"
                control={control}
                render={({ field }) => (
                  <Checkbox 
                    id="terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                I agree to the <span className="font-semibold text-foreground">Terms of Service</span> and <span className="font-semibold text-foreground">Privacy Policy</span>
              </label>
            </div>
            {errors.agreeToTerms && (
              <div className="flex items-center gap-1 text-xs font-medium text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.agreeToTerms.message}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full rounded-lg py-6 text-base font-semibold">
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
