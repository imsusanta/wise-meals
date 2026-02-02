import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Droplets, 
  TrendingUp, 
  Lightbulb,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useRecipeGenerator } from "@/hooks/useRecipeGenerator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface HydrationLog {
  glasses: number;
}

interface HealthTip {
  content: string;
  category: string;
}

export default function Home() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { generateRecipe, isGenerating } = useRecipeGenerator();
  const [hydrationGlasses, setHydrationGlasses] = useState(0);
  const [healthTip, setHealthTip] = useState<HealthTip | null>(null);
  const [isAddingWater, setIsAddingWater] = useState(false);

  const greeting = getGreeting();
  const today = format(new Date(), "EEEE, MMMM d");

  useEffect(() => {
    fetchTodaysHydration();
    fetchHealthTip();
  }, [user]);

  const fetchTodaysHydration = async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("hydration_logs")
      .select("glasses")
      .eq("user_id", user.id)
      .gte("logged_at", today.toISOString())
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

  const handleQuickSuggestion = async () => {
    const hour = new Date().getHours();
    let mealType = "snack";
    if (hour < 10) mealType = "breakfast";
    else if (hour < 14) mealType = "lunch";
    else if (hour < 19) mealType = "dinner";

    await generateRecipe(`Suggest a quick, healthy ${mealType} recipe that's easy to prepare.`);
  };

  const hydrationProgress = Math.min((hydrationGlasses / 8) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title={`${greeting}${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}! ☀️`}
        subtitle={today}
        showSettings
      />

      <div className="container px-4 py-6 space-y-6">
        {/* Quick AI Suggestion */}
        <Button 
          size="lg" 
          className="w-full h-16 text-lg font-semibold gap-3 bg-secondary hover:bg-secondary/90"
          onClick={handleQuickSuggestion}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Sparkles className="h-6 w-6" />
          )}
          What Should I Eat Now?
        </Button>

        {/* Today's Meals */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Today's Meals</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/plan" className="text-primary">
                  View Week <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <MealSlot type="Breakfast" emoji="🍳" time="8:00 AM" />
            <MealSlot type="Lunch" emoji="🥗" time="12:30 PM" />
            <MealSlot type="Dinner" emoji="🍽️" time="6:00 PM" />
            <MealSlot type="Snack" emoji="🍎" time="3:00 PM" />
          </CardContent>
        </Card>

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
                  {hydrationGlasses} of 8 glasses today
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                onClick={addGlass}
                disabled={isAddingWater}
              >
                {isAddingWater ? <Loader2 className="h-4 w-4 animate-spin" /> : "+ Add Glass"}
              </Button>
            </div>
            <Progress 
              value={hydrationProgress} 
              className="h-3"
            />
          </CardContent>
        </Card>

        {/* Weekly Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">This Week's Nutrition</h3>
                <p className="text-sm text-muted-foreground">
                  Track your progress!
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground">Fiber</p>
                <p className="text-lg font-bold text-primary">Good</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground">Sodium</p>
                <p className="text-lg font-bold text-primary">Low</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/10">
                <p className="text-sm text-muted-foreground">Protein</p>
                <p className="text-lg font-bold text-secondary">Fair</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    Tip of the Day
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {healthTip.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function MealSlot({ type, emoji, time }: { type: string; emoji: string; time: string }) {
  return (
    <Link 
      to="/plan"
      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
    >
      <span className="text-3xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{type}</p>
        <p className="text-muted-foreground italic">Tap to plan</p>
      </div>
      <span className="text-sm text-muted-foreground shrink-0">
        {time}
      </span>
    </Link>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}
