import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  Leaf,
  Activity
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useRecipeGenerator } from "@/hooks/useRecipeGenerator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { DIETARY_RESTRICTION_LABELS, type DietaryRestriction } from "@/types/health-profile";
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
    color: "bg-blue-500/10 border-blue-500/30 hover:border-blue-500",
    description: "Low glycemic, blood sugar friendly"
  },
  { 
    id: "heart-healthy", 
    label: "Heart-Healthy", 
    emoji: "❤️", 
    color: "bg-red-500/10 border-red-500/30 hover:border-red-500",
    description: "Low sodium, cholesterol conscious"
  },
  { 
    id: "anti-inflammatory", 
    label: "Anti-Inflammatory", 
    emoji: "🦴", 
    color: "bg-orange-500/10 border-orange-500/30 hover:border-orange-500",
    description: "Joint & arthritis friendly"
  },
  { 
    id: "bone-health", 
    label: "Bone Health", 
    emoji: "💪", 
    color: "bg-purple-500/10 border-purple-500/30 hover:border-purple-500",
    description: "Calcium & Vitamin D rich"
  },
  { 
    id: "kidney-friendly", 
    label: "Kidney-Friendly", 
    emoji: "🫘", 
    color: "bg-green-500/10 border-green-500/30 hover:border-green-500",
    description: "Low potassium & phosphorus"
  },
  { 
    id: "gerd-friendly", 
    label: "GERD/Reflux", 
    emoji: "🌿", 
    color: "bg-teal-500/10 border-teal-500/30 hover:border-teal-500",
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
      // Navigate to recipes to see the saved recipe
      navigate("/recipes");
    }
  };

  const hydrationProgress = Math.min((hydrationGlasses / 8) * 100, 100);

  // Check for medication interactions
  const hasMedicationWarnings = medications.some(med => 
    med.food_interactions && med.food_interactions.length > 0
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title={`${greeting}${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!`}
        subtitle={today}
        showSettings
        showLogo
      />

      <div className="container px-4 py-4 space-y-4 animate-fade-in scroll-native">
        {/* Medication Alert Banner */}
        {hasMedicationWarnings && (
          <div 
            className="bg-warning/10 rounded-2xl border border-warning/30 p-4 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer tap-highlight-none"
            onClick={() => setShowMedAlert(true)}
          >
            <div className="w-11 h-11 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">Medication Food Alerts</h3>
              <p className="text-xs text-muted-foreground truncate">
                {medications.length} medication(s) with interactions
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        )}

        {/* MAIN FEATURE: Health Condition-Based Meal Planning */}
        <div>
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Get Meals For Your Health
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {healthConditions.map((condition) => (
              <div 
                key={condition.id}
                className={cn(
                  "rounded-2xl p-3.5 text-center cursor-pointer transition-all tap-highlight-none select-none",
                  "active:scale-[0.97] border-2",
                  condition.color,
                  isGenerating && selectedCondition === condition.id && "ring-2 ring-primary ring-offset-2"
                )}
                onClick={() => !isGenerating && handleConditionSelect(condition.id)}
              >
                <div className="text-3xl mb-1.5">{condition.emoji}</div>
                <h3 className="font-semibold text-xs mb-0.5">{condition.label}</h3>
                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                  {condition.description}
                </p>
                {isGenerating && selectedCondition === condition.id && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto mt-1.5 text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 gap-2.5">
          <Button 
            size="lg" 
            className="h-14 text-sm font-semibold gap-2 bg-primary hover:bg-primary/90 rounded-2xl active:scale-[0.97] transition-transform"
            onClick={() => navigate("/plan")}
          >
            <Sparkles className="h-4 w-4" />
            Plan My Week
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="h-14 text-sm font-semibold gap-2 rounded-2xl active:scale-[0.97] transition-transform"
            onClick={() => navigate("/recipes")}
          >
            <Flame className="h-4 w-4" />
            Browse Recipes
          </Button>
        </div>

        {/* Today's Meals Quick View */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <span className="font-semibold text-sm">Today's Meals</span>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
              <Link to="/plan" className="text-primary">
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-border/30">
            <MealSlot type="Breakfast" emoji="🍳" time="8:00 AM" />
            <MealSlot type="Lunch" emoji="🥗" time="12:30 PM" />
            <MealSlot type="Dinner" emoji="🍽️" time="6:00 PM" />
          </div>
        </div>

        {/* Hydration + Nutrition Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Hydration Tracker */}
          <div className="bg-accent/5 rounded-2xl border border-accent/20 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Stay Hydrated</h3>
                <p className="text-xs text-muted-foreground">
                  {hydrationGlasses} of 8 glasses
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 w-9 p-0 border-accent text-accent hover:bg-accent hover:text-accent-foreground rounded-xl active:scale-95 transition-transform"
                onClick={addGlass}
                disabled={isAddingWater}
              >
                {isAddingWater ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
            <Progress value={hydrationProgress} className="h-2" />
          </div>

          {/* Quick Nutrition Summary */}
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Today's Nutrition</h3>
                <p className="text-xs text-muted-foreground">Looking good!</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-primary/10">
                <p className="font-bold text-primary text-sm">✓</p>
                <p className="text-[10px] text-muted-foreground">Fiber</p>
              </div>
              <div className="p-2 rounded-xl bg-primary/10">
                <p className="font-bold text-primary text-sm">✓</p>
                <p className="text-[10px] text-muted-foreground">Sodium</p>
              </div>
              <div className="p-2 rounded-xl bg-secondary/10">
                <p className="font-bold text-secondary text-sm">⚡</p>
                <p className="text-[10px] text-muted-foreground">Protein</p>
              </div>
            </div>
          </div>
        </div>

        {/* Health Tip */}
        {healthTip && (
          <div className="bg-primary/5 rounded-2xl border border-primary/20 p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-primary mb-1">
                  Health Tip
                </h3>
                <p className="text-xs text-foreground leading-relaxed">
                  {healthTip.content}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Medications CTA */}
        {medications.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Pill className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Add Your Medications</h3>
              <p className="text-xs text-muted-foreground">
                Get alerts about food-drug interactions
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-xl h-8 text-xs">
              <Link to="/settings">Add</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Medication Alert Dialog */}
      <Dialog open={showMedAlert} onOpenChange={setShowMedAlert}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Medication Food Alerts
            </DialogTitle>
            <DialogDescription>
              These are foods to be careful with based on your medications.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {medications.map((med) => (
              <div key={med.id} className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  {med.name}
                </h4>
                {med.food_interactions && med.food_interactions.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {med.food_interactions.map((interaction, i) => (
                      <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-warning mt-1 shrink-0" />
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
      className="flex items-center gap-3 px-4 py-3 active:bg-muted/50 transition-colors tap-highlight-none"
    >
      <span className="text-xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{type}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
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
