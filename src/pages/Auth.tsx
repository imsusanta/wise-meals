import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Mail, Lock, User, Eye, EyeOff, UserRound, ArrowRight, Apple, Carrot, Salad, Heart, Utensils, Cherry, Fish, Egg, Wheat, Coffee, Soup, Cookie } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type AuthMode = "welcome" | "signin" | "signup";

// Floating food icons for background decoration
const FloatingIcon = ({ 
  icon: Icon, 
  className, 
  delay = 0 
}: { 
  icon: React.ElementType; 
  className: string; 
  delay?: number;
}) => (
  <div 
    className={`absolute text-white/10 ${className}`}
    style={{ 
      animation: `float 6s ease-in-out infinite`,
      animationDelay: `${delay}s`
    }}
  >
    <Icon className="w-full h-full" strokeWidth={1.5} />
  </div>
);

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
    
    const guestId = crypto.randomUUID().slice(0, 8);
    const guestEmail = `guest_${guestId}@nourishwise.local`;
    const guestPassword = crypto.randomUUID();

    const { data, error } = await supabase.auth.signUp({
      email: guestEmail,
      password: guestPassword,
      options: {
        data: {
          full_name: "Guest User",
          is_guest: true,
        },
      },
    });

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
      await supabase.from("profiles").insert({
        user_id: data.user.id,
        full_name: "Guest User",
      });

      await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPassword,
      });
    }

    setIsGuestLoading(false);
  };

  // Welcome Screen with beautiful food graphics
  if (mode === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-primary/90 flex flex-col relative overflow-hidden">
        {/* Floating Food Icons Background */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(5deg); }
          }
        `}</style>
        
        {/* Top left cluster */}
        <FloatingIcon icon={Apple} className="top-12 left-6 w-10 h-10" delay={0} />
        <FloatingIcon icon={Carrot} className="top-28 left-16 w-8 h-8" delay={1.5} />
        <FloatingIcon icon={Coffee} className="top-8 left-28 w-7 h-7" delay={0.8} />
        
        {/* Top right cluster */}
        <FloatingIcon icon={Salad} className="top-16 right-8 w-12 h-12" delay={0.5} />
        <FloatingIcon icon={Cherry} className="top-32 right-24 w-6 h-6" delay={2} />
        <FloatingIcon icon={Egg} className="top-10 right-32 w-7 h-7" delay={1.2} />
        
        {/* Middle left */}
        <FloatingIcon icon={Fish} className="top-1/3 left-4 w-9 h-9" delay={1.8} />
        <FloatingIcon icon={Wheat} className="top-1/2 left-8 w-8 h-8" delay={0.3} />
        
        {/* Middle right */}
        <FloatingIcon icon={Soup} className="top-1/3 right-6 w-10 h-10" delay={2.5} />
        <FloatingIcon icon={Cookie} className="top-1/2 right-12 w-7 h-7" delay={1} />
        
        {/* Bottom scattered */}
        <FloatingIcon icon={Utensils} className="bottom-48 left-12 w-8 h-8" delay={0.7} />
        <FloatingIcon icon={Heart} className="bottom-56 right-10 w-6 h-6" delay={1.5} />
        <FloatingIcon icon={Apple} className="bottom-64 left-28 w-7 h-7" delay={2.2} />
        <FloatingIcon icon={Carrot} className="bottom-52 right-28 w-8 h-8" delay={0.4} />

        {/* App Icon & Branding */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
          <div className="w-28 h-28 bg-white/20 rounded-[2rem] flex items-center justify-center mb-8 backdrop-blur-md shadow-2xl border border-white/20">
            <Leaf className="h-16 w-16 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">NourishWise</h1>
          <p className="text-xl text-white/90 max-w-sm leading-relaxed">
            Smart meal planning for a healthier, happier you
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="px-6 pb-12 space-y-4 relative z-10">
          <Button 
            size="lg"
            className="w-full h-16 text-lg font-semibold bg-white text-primary hover:bg-white/95 rounded-2xl shadow-lg shadow-black/10"
            onClick={() => setMode("signup")}
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost"
            size="lg"
            className="w-full h-14 text-lg text-white hover:bg-white/10 rounded-2xl"
            onClick={() => setMode("signin")}
          >
            I already have an account
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-white/60 bg-primary">or</span>
            </div>
          </div>

          <Button 
            variant="outline"
            size="lg"
            className="w-full h-14 text-lg font-medium border-2 border-white/30 bg-white/5 text-white hover:bg-white/10 rounded-2xl backdrop-blur-sm"
            onClick={handleGuestAccess}
            disabled={isGuestLoading}
          >
            <UserRound className="mr-2 h-5 w-5" />
            {isGuestLoading ? "Starting..." : "Try as Guest"}
          </Button>
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
