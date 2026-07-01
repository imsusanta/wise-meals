import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type AuthMode = "welcome" | "signin" | "signup";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkOnboardingStatus(session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkOnboardingStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkOnboardingStatus = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile?.onboarding_completed) {
      navigate("/");
    } else {
      navigate("/onboarding");
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Account exists",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      }
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        user_id: data.user.id,
        full_name: fullName,
      });

      toast({
        title: "Welcome to NourishWise!",
        description: "Your account has been created.",
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast({
          title: "Sign in failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else if (error.message.includes("Email not confirmed")) {
        toast({
          title: "Email not verified",
          description: "Please check your email and click the verification link.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleGuestAccess = async () => {
    setIsGuestLoading(true);
    
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      toast({
        title: "Couldn't start guest session",
        description: "Please try again or create an account.",
        variant: "destructive",
      });
      setIsGuestLoading(false);
      return;
    }

    if (data.user) {
      // Create profile for anonymous user
      await supabase.from("profiles").insert({
        user_id: data.user.id,
        full_name: "Guest User",
      });
    }

    setIsGuestLoading(false);
  };

  // Welcome Screen with beautiful food graphics
  if (mode === "welcome") {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-6 relative overflow-hidden">
        {/* Soft ambient blurs */}
        <div className="absolute top-10 -left-10 w-56 h-56 bg-primary-foreground/20 rounded-full opacity-50 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute bottom-32 -right-16 w-72 h-72 bg-primary-foreground/10 rounded-full opacity-40 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl pointer-events-none" aria-hidden />

        <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-between text-center min-h-[600px]">
          {/* Branding */}
          <div className="mt-8 flex flex-col items-center animate-fade-in">
            <div className="bg-primary-foreground p-5 rounded-3xl shadow-2xl inline-block mb-8">
              <Leaf className="w-12 h-12 text-primary" strokeWidth={2} aria-hidden />
            </div>
            <h1 className="text-primary-foreground text-5xl font-bold tracking-tight mb-3">
              NourishWise
            </h1>
            <p className="text-primary-foreground/90 text-lg font-medium max-w-xs leading-relaxed">
              Smart meal planning for a healthier, happier you.
            </p>
          </div>

          {/* Actions */}
          <div className="w-full space-y-4 mt-12">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/95 rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
              onClick={() => setMode("signup")}
              aria-label="Get started — create a new account"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </Button>

            <div className="flex flex-col gap-3 items-center pt-1">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-primary-foreground/90 hover:text-primary-foreground font-medium text-base py-2 min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60 rounded-lg px-3"
              >
                I already have an account
              </button>

              <div className="w-12 h-px bg-primary-foreground/20 my-1" aria-hidden />

              <Button
                variant="outline"
                size="lg"
                onClick={handleGuestAccess}
                disabled={isGuestLoading}
                className="w-full h-14 text-base font-medium border border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground rounded-2xl backdrop-blur-sm active:scale-[0.98] transition-transform"
              >
                {isGuestLoading ? "Starting..." : "Try as Guest"}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-primary-foreground/60 text-xs px-6 mt-10 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  // Sign In / Sign Up Form
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <button 
          onClick={() => setMode("welcome")}
          className="text-muted-foreground mb-8 flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-foreground">
          {mode === "signin" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {mode === "signin" 
            ? "Sign in to continue to NourishWise" 
            : "Join NourishWise for personalized meal planning"
          }
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6">
        <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-5">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">Your Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-xl border-2 border-border focus:border-primary"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 text-lg rounded-xl border-2 border-border focus:border-primary"
                required
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={mode === "signin" ? "Enter password" : "At least 6 characters"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 h-14 text-lg rounded-xl border-2 border-border focus:border-primary"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full h-14 text-lg font-semibold rounded-xl mt-8"
            disabled={isLoading}
          >
            {isLoading 
              ? (mode === "signin" ? "Signing in..." : "Creating account...") 
              : (mode === "signin" ? "Sign In" : "Create Account")
            }
          </Button>
        </form>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 text-center">
        <p className="text-muted-foreground">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-primary font-semibold"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
