import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Mail, Lock, User, Eye, EyeOff, UserRound, Heart, Shield, Clock } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export default function Auth() {
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
        description: "Please check your email to verify your account.",
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
    
    // Generate a unique guest email and password
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
      // Create profile for guest
      await supabase.from("profiles").insert({
        user_id: data.user.id,
        full_name: "Guest User",
      });

      // Sign in as guest immediately (since no email verification for demo purposes)
      await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPassword,
      });
    }

    setIsGuestLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="bg-primary/10 px-6 py-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-4">
          <Leaf className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">NourishWise</h1>
        <p className="text-lg text-muted-foreground max-w-sm mx-auto">
          Health-focused meal planning tailored to your needs
        </p>
        
        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto text-left">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-medium">Health Focused</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-2">
              <Shield className="h-6 w-6 text-secondary" />
            </div>
            <span className="text-sm font-medium">Med Alerts</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <span className="text-sm font-medium">Easy Recipes</span>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="flex-1 px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          {/* Guest Access - Prominent */}
          <Button 
            variant="outline"
            size="lg"
            className="w-full h-16 text-lg font-semibold gap-3 mb-6 border-2 border-primary/30 hover:border-primary hover:bg-primary/5"
            onClick={handleGuestAccess}
            disabled={isGuestLoading}
          >
            {isGuestLoading ? (
              "Starting guest session..."
            ) : (
              <>
                <UserRound className="h-6 w-6" />
                Continue as Guest
              </>
            )}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">
                Or sign in for full features
              </span>
            </div>
          </div>

          <Card className="border-2">
            <Tabs defaultValue="signin" className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2 h-14">
                  <TabsTrigger value="signin" className="text-lg">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="text-lg">Sign Up</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                {/* Sign In Tab */}
                <TabsContent value="signin" className="mt-0">
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-base">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-12 h-14 text-lg"
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-base">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-12 pr-12 h-14 text-lg"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
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
                      className="w-full h-14 text-lg font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up Tab */}
                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-base">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Your name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-12 h-14 text-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-base">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-12 h-14 text-lg"
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-base">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-12 pr-12 h-14 text-lg"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
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
                      className="w-full h-14 text-lg font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                      By signing up, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
