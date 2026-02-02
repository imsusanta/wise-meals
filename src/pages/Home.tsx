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

      <div className="container px-4 py-6 space-y-6">
        {/* Medication Alert Banner */}
        {hasMedicationWarnings && (
          <Card 
            className="bg-warning/10 border-warning/30 cursor-pointer hover:bg-warning/20 transition-colors"
            onClick={() => setShowMedAlert(true)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-warning-foreground">Medication Food Alerts</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {medications.length} medication(s) with food interactions
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        )}

        {/* MAIN FEATURE: Health Condition-Based Meal Planning */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Get Meals For Your Health
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {healthConditions.map((condition) => (
              <Card 
                key={condition.id}
                className={cn(
                  "cursor-pointer transition-all border-2",
                  condition.color,
                  isGenerating && selectedCondition === condition.id && "ring-2 ring-primary"
                )}
                onClick={() => !isGenerating && handleConditionSelect(condition.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{condition.emoji}</div>
                  <h3 className="font-semibold text-sm mb-1">{condition.label}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {condition.description}
                  </p>
                  {isGenerating && selectedCondition === condition.id && (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mt-2 text-primary" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            size="lg" 
            className="h-16 text-base font-semibold gap-2 bg-primary hover:bg-primary/90"
            onClick={() => navigate("/plan")}
          >
            <Sparkles className="h-5 w-5" />
            Plan My Week
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="h-16 text-base font-semibold gap-2"
            onClick={() => navigate("/recipes")}
          >
            <Flame className="h-5 w-5" />
            Browse Recipes
          </Button>
        </div>

        {/* Today's Meals Quick View */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Today's Meals</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/plan" className="text-primary">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <MealSlot type="Breakfast" emoji="🍳" time="8:00 AM" />
            <MealSlot type="Lunch" emoji="🥗" time="12:30 PM" />
            <MealSlot type="Dinner" emoji="🍽️" time="6:00 PM" />
          </CardContent>
        </Card>

        {/* Hydration + Nutrition Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hydration Tracker */}
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Stay Hydrated</h3>
                  <p className="text-sm text-muted-foreground">
                    {hydrationGlasses} of 8 glasses
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  onClick={addGlass}
                  disabled={isAddingWater}
                >
                  {isAddingWater ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
              <Progress value={hydrationProgress} className="h-3" />
            </CardContent>
          </Card>

          {/* Quick Nutrition Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Today's Nutrition</h3>
                  <p className="text-sm text-muted-foreground">Looking good!</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="p-2 rounded bg-primary/10">
                  <p className="font-bold text-primary">✓</p>
                  <p className="text-xs text-muted-foreground">Fiber</p>
                </div>
                <div className="p-2 rounded bg-primary/10">
                  <p className="font-bold text-primary">✓</p>
                  <p className="text-xs text-muted-foreground">Sodium</p>
                </div>
                <div className="p-2 rounded bg-secondary/10">
                  <p className="font-bold text-secondary">⚡</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Tip */}
        {healthTip && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-1">
                    Health Tip
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {healthTip.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Medications CTA */}
        {medications.length === 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Pill className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Add Your Medications</h3>
                <p className="text-sm text-muted-foreground">
                  Get alerts about food-drug interactions
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/settings">Add</Link>
              </Button>
            </CardContent>
          </Card>
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
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{type}</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
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
