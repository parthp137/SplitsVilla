import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoginSchema } from "@/lib/validationSchemas";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPw, setShowPw] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(LoginSchema),
    mode: "onBlur"
  });

  const onSubmit = async (data: any) => {
    try {
      console.log("🔐 Logging in with:", data.email);
      await login(data.email, data.password);
      toast({ title: "Welcome back! 🎉" });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("❌ Login error:", error);
      toast({ 
        title: "Login failed",
        description: error?.message || "Invalid email or password. Please try again.",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 bg-gradient-to-br from-primary via-primary-dark to-secondary p-12 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/20">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-extrabold text-primary-foreground">SplitsVilla</span>
        </Link>
        <div>
          <h2 className="font-heading text-4xl font-extrabold leading-tight text-primary-foreground">
            Travel together,<br />split smarter.
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {["🏡 Group Stays", "💰 Fair Splitting", "🗳️ Vote Together"].map((t) => (
              <span key={t} className="rounded-full bg-primary-foreground/15 px-4 py-2 text-sm font-medium text-primary-foreground backdrop-blur-sm">{t}</span>
            ))}
          </div>
        </div>
        <p className="text-sm text-primary-foreground/60">© 2025 SplitsVilla, Inc.</p>
      </div>

      {/* Right form */}
      <div className="flex w-full items-center justify-center bg-card p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-extrabold text-foreground">SplitsVilla</span>
          </Link>
          <h1 className="font-heading text-3xl font-extrabold text-foreground">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Log in to continue planning your trips</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email Address</label>
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
              {errors.password && (
                <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </div>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full rounded-lg py-6 text-base font-semibold">
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>

            <div className="text-center">
              <Link to="/password-reset" className="text-sm text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
