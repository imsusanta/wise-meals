import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Sparkles, 
  Droplets, 
  Heart,
  Lightbulb,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Pill,
  Plus,
  Clock,
  Flame,
  Activity
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useRecipeGenerator } from "@/hooks/useRecipeGenerator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface HydrationLog {
  glasses: number;
}

interface HealthTip {
  content: string;
  category: string;
}

interface Medication {
  id: string;
  name: string;
  food_interactions: string[];
}

// Health condition cards for the main feature
const healthConditions = [
  { 
    id: "diabetes-friendly", 
    label: "Diabetes-Friendly", 
    emoji: "🩺", 
    gradient: "from-blue-500/25 via-blue-400/15 to-blue-300/5",
    iconBg: "bg-blue-500/20",
    description: "Low glycemic, blood sugar friendly"
  },
  { 
    id: "heart-healthy", 
    label: "Heart-Healthy", 
    emoji: "❤️", 
    gradient: "from-rose-500/25 via-rose-400/15 to-rose-300/5",
    iconBg: "bg-rose-500/20",
    description: "Low sodium, cholesterol conscious"
  },
  { 
    id: "anti-inflammatory", 
    label: "Anti-Inflammatory", 
    emoji: "🦴", 
    gradient: "from-orange-500/25 via-orange-400/15 to-orange-300/5",
    iconBg: "bg-orange-500/20",
    description: "Joint & arthritis friendly"
  },
  { 
    id: "bone-health", 
    label: "Bone Health", 
    emoji: "💪", 
    gradient: "from-purple-500/25 via-purple-400/15 to-purple-300/5",
    iconBg: "bg-purple-500/20",
    description: "Calcium & Vitamin D rich"
  },
  { 
    id: "kidney-friendly", 
    label: "Kidney-Friendly", 
    emoji: "🫘", 
    gradient: "from-green-500/25 via-green-400/15 to-green-300/5",
    iconBg: "bg-green-500/20",
    description: "Low potassium & phosphorus"
  },
  { 
    id: "gerd-friendly", 
    label: "GERD/Reflux", 
    emoji: "🌿", 
    gradient: "from-teal-500/25 via-teal-400/15 to-teal-300/5",
    iconBg: "bg-teal-500/20",
    description: "Avoid trigger foods"
  },
];

export default function Home() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { generateRecipe, isGenerating } = useRecipeGenerator();
  const [hydrationGlasses, setHydrationGlasses] = useState(0);
  const [healthTip, setHealthTip] = useState<HealthTip | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isAddingWater, setIsAddingWater] = useState(false);
  const [showMedAlert, setShowMedAlert] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  const greeting = getGreeting();
  const today = format(new Date(), "EEEE, MMMM d");

  useEffect(() => {
    fetchTodaysHydration();
    fetchHealthTip();
    fetchMedications();
  }, [user]);

  const fetchTodaysHydration = async () => {
    if (!user) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("hydration_logs")
      .select("glasses")
      .eq("user_id", user.id)
      .gte("logged_at", todayStart.toISOString())
      .order("logged_at", { ascending: false });

    if (data) {
      const total = data.reduce((sum: number, log: HydrationLog) => sum + log.glasses, 0);
      setHydrationGlasses(total);
    }
  };

  const fetchHealthTip = async () => {
    const { data } = await supabase
      .from("health_tips")
      .select("content, category")
      .eq("is_active", true)
      .limit(10);

    if (data && data.length > 0) {
      const randomTip = data[Math.floor(Math.random() * data.length)];
      setHealthTip(randomTip);
    }
  };

  const fetchMedications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("medications")
      .select("id, name, food_interactions")
      .eq("user_id", user.id);

    if (data) {
      setMedications(data);
    }
  };

  const addGlass = async () => {
    if (!user) return;
    setIsAddingWater(true);

    const { error } = await supabase
      .from("hydration_logs")
      .insert({
        user_id: user.id,
        glasses: 1,
      });

    if (!error) {
      setHydrationGlasses(prev => prev + 1);
      if (hydrationGlasses + 1 === 8) {
        toast({
          title: "Great job! 🎉",
          description: "You've reached your daily water goal!",
        });
      }
    }
    setIsAddingWater(false);
  };

  const handleConditionSelect = async (conditionId: string) => {
    setSelectedCondition(conditionId);
    const condition = healthConditions.find(c => c.id === conditionId);
    if (!condition) return;

    const hour = new Date().getHours();
    let mealType = "snack";
    if (hour < 10) mealType = "breakfast";
    else if (hour < 14) mealType = "lunch";
    else if (hour < 19) mealType = "dinner";

    const result = await generateRecipe(
      `Create a ${condition.label} ${mealType} recipe. Focus on ${condition.description}. Make it easy to prepare, suitable for 1-2 servings.`,
      { autoSave: true }
    );
    
    setSelectedCondition(null);
    
    if (result) {
      navigate("/recipes");
    }
  };

  const hydrationProgress = Math.min((hydrationGlasses / 8) * 100, 100);

  const hasMedicationWarnings = medications.some(med => 
    med.food_interactions && med.food_interactions.length > 0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Greeting Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="container px-4 sm:px-5 py-4 sm:py-5">
          <h1 className="text-xl sm:text-2xl font-bold">
            {greeting}{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
      </div>

      <div className="container px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5 animate-fade-in scroll-native">
        {/* Medication Alert Banner */}
        {hasMedicationWarnings && (
          <button 
            className={cn(
              "w-full relative overflow-hidden rounded-2xl sm:rounded-3xl p-4",
              "bg-gradient-to-br from-warning/20 via-warning/10 to-warning/5",
              "border border-warning/30 hover:border-warning/50",
              "transition-all duration-300 active:scale-[0.98]",
              "tap-highlight-none touch-manipulation group text-left"
            )}
            onClick={() => setShowMedAlert(true)}
          >
            <div className="absolute inset-0 bg-card/40 backdrop-blur-sm" />
            <div className="relative flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-warning/20 backdrop-blur-sm flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base">Medication Food Alerts</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {medications.length} medication(s) with interactions
                </p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-warning/10 flex items-center justify-center">
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              </div>
            </div>
          </button>
        )}

        {/* MAIN FEATURE: Health Condition-Based Meal Planning */}
        <div>
          <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <span>Get Meals For Your Health</span>
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {healthConditions.map((condition, index) => (
              <button 
                key={condition.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 text-center",
                  "bg-gradient-to-br",
                  condition.gradient,
                  "border border-border/40 hover:border-primary/30",
                  "transition-all duration-300 active:scale-[0.97]",
                  "tap-highlight-none touch-manipulation group",
                  isGenerating && selectedCondition === condition.id && "ring-2 ring-primary ring-offset-2",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => !isGenerating && handleConditionSelect(condition.id)}
                disabled={isGenerating}
              >
                {/* Glass overlay */}
                <div className="absolute inset-0 bg-card/50 backdrop-blur-sm" />
                
                <div className="relative">
                  <div className={cn(
                    "w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-xl sm:rounded-2xl mb-2 sm:mb-3",
                    condition.iconBg, "backdrop-blur-sm",
                    "flex items-center justify-center text-2xl sm:text-3xl",
                    "shadow-sm border border-border/20"
                  )}>
                    {isGenerating && selectedCondition === condition.id ? (
                      <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin text-primary" />
                    ) : (
                      condition.emoji
                    )}
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">{condition.label}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 leading-tight">
                    {condition.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <Button 
            size="lg" 
            className={cn(
              "h-14 sm:h-16 text-sm sm:text-base font-bold gap-2 rounded-2xl sm:rounded-3xl",
              "bg-gradient-to-r from-primary to-primary/80",
              "hover:from-primary/90 hover:to-primary/70",
              "shadow-lg shadow-primary/20",
              "active:scale-[0.97] transition-all duration-200"
            )}
            onClick={() => navigate("/plan")}
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            Plan My Week
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className={cn(
              "h-14 sm:h-16 text-sm sm:text-base font-bold gap-2 rounded-2xl sm:rounded-3xl",
              "border-2 border-border/50 hover:border-secondary/50",
              "bg-gradient-to-br from-card to-muted/30",
              "hover:from-secondary/10 hover:to-secondary/5",
              "active:scale-[0.97] transition-all duration-200"
            )}
            onClick={() => navigate("/recipes")}
          >
            <Flame className="h-4 w-4 sm:h-5 sm:w-5" />
            Browse Recipes
          </Button>
        </div>

        {/* Today's Meals Quick View */}
        <div className={cn(
          "relative overflow-hidden rounded-2xl sm:rounded-3xl",
          "bg-gradient-to-br from-card via-card/95 to-muted/20",
          "border border-border/40"
        )}>
          <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />
          <div className="relative">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-border/30">
              <span className="font-bold text-sm sm:text-base">Today's Meals</span>
              <Button variant="ghost" size="sm" asChild className="h-8 text-xs sm:text-sm text-primary hover:text-primary/80">
                <Link to="/plan" className="gap-1">
                  View All <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="divide-y divide-border/30">
              <MealSlot type="Breakfast" emoji="🍳" time="8:00 AM" />
              <MealSlot type="Lunch" emoji="🥗" time="12:30 PM" />
              <MealSlot type="Dinner" emoji="🍽️" time="6:00 PM" />
            </div>
          </div>
        </div>

        {/* Hydration + Nutrition Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Hydration Tracker */}
          <div className={cn(
            "relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5",
            "bg-gradient-to-br from-accent/20 via-accent/10 to-accent/5",
            "border border-accent/30"
          )}>
            <div className="absolute inset-0 bg-card/50 backdrop-blur-sm" />
            <div className="relative">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-accent/20 backdrop-blur-sm flex items-center justify-center border border-accent/20">
                  <Droplets className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm sm:text-base">Stay Hydrated</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {hydrationGlasses} of 8 glasses
                  </p>
                </div>
                <Button 
                  size="sm" 
                  className={cn(
                    "h-10 w-10 sm:h-11 sm:w-11 p-0 rounded-xl sm:rounded-2xl",
                    "bg-accent hover:bg-accent/90 text-accent-foreground",
                    "shadow-md shadow-accent/20",
                    "active:scale-95 transition-transform"
                  )}
                  onClick={addGlass}
                  disabled={isAddingWater}
                >
                  {isAddingWater ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Plus className="h-4 w-4 sm:h-5 sm:w-5" />}
                </Button>
              </div>
              <Progress value={hydrationProgress} className="h-2.5 sm:h-3" />
            </div>
          </div>

          {/* Quick Nutrition Summary */}
          <div className={cn(
            "relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5",
            "bg-gradient-to-br from-primary/15 via-primary/8 to-primary/3",
            "border border-primary/20"
          )}>
            <div className="absolute inset-0 bg-card/50 backdrop-blur-sm" />
            <div className="relative">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/20">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Today's Nutrition</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Looking good!</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-background/60 backdrop-blur-sm text-center border border-border/20">
                  <p className="font-bold text-primary text-base sm:text-lg">✓</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Fiber</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-background/60 backdrop-blur-sm text-center border border-border/20">
                  <p className="font-bold text-primary text-base sm:text-lg">✓</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Sodium</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-background/60 backdrop-blur-sm text-center border border-border/20">
                  <p className="font-bold text-secondary text-base sm:text-lg">⚡</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Protein</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Tip */}
        {healthTip && (
          <div className={cn(
            "relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5",
            "bg-gradient-to-br from-secondary/15 via-secondary/8 to-secondary/3",
            "border border-secondary/20"
          )}>
            <div className="absolute inset-0 bg-card/50 backdrop-blur-sm" />
            <div className="relative flex gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-secondary/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-secondary/20">
                <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-secondary mb-1">
                  Health Tip of the Day
                </h3>
                <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                  {healthTip.content}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Medications CTA */}
        {medications.length === 0 && (
          <div className={cn(
            "relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5",
            "border-2 border-dashed border-muted-foreground/30",
            "bg-gradient-to-br from-muted/30 via-muted/20 to-transparent"
          )}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center border border-border/30">
                <Pill className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base">Add Your Medications</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Get alerts about food-drug interactions
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className="rounded-xl sm:rounded-2xl h-9 sm:h-10 text-xs sm:text-sm font-semibold"
              >
                <Link to="/settings">Add</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Bottom spacing for nav */}
        <div className="h-20" />
      </div>

      {/* Medication Alert Dialog */}
      <Dialog open={showMedAlert} onOpenChange={setShowMedAlert}>
        <DialogContent className="max-w-lg rounded-3xl border-border/50 p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-warning/10 via-warning/5 to-transparent p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                Medication Food Alerts
              </DialogTitle>
              <DialogDescription className="text-base">
                These are foods to be careful with based on your medications.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6 pt-2 space-y-4">
            {medications.map((med) => (
              <div key={med.id} className="p-4 rounded-2xl bg-muted/50 border border-border/30">
                <h4 className="font-bold flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  {med.name}
                </h4>
                {med.food_interactions && med.food_interactions.length > 0 ? (
                  <div className="mt-2 space-y-1.5">
                    {med.food_interactions.map((interaction, i) => (
                      <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                        {interaction}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    No known food interactions
                  </p>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MealSlot({ type, emoji, time }: { type: string; emoji: string; time: string }) {
  return (
    <Link 
      to="/plan"
      className={cn(
        "flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4",
        "hover:bg-muted/30 active:bg-muted/50 transition-colors",
        "tap-highlight-none touch-manipulation"
      )}
    >
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-background/60 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl border border-border/20">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm sm:text-base">{type}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        {time}
      </div>
    </Link>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}
