import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Clock, Check, X, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRecipeGenerator } from "@/hooks/useRecipeGenerator";
import { useToast } from "@/hooks/use-toast";

interface MealPlanItem {
  id: string;
  day_of_week: number;
  meal_type: string;
  custom_meal_name: string | null;
  is_prepared: boolean;
  is_skipped: boolean;
  recipe_id: string | null;
  recipes?: {
    title: string;
  } | null;
}

const mealSlots = ["breakfast", "lunch", "dinner", "snack"] as const;
const mealLabels: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};
const mealEmojis: Record<string, string> = {
  breakfast: "🍳",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍎",
};

export default function Plan() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { generateRecipe, isGenerating } = useRecipeGenerator();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [mealPlanId, setMealPlanId] = useState<string | null>(null);
  const [mealItems, setMealItems] = useState<MealPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingWeek, setIsGeneratingWeek] = useState(false);

  useEffect(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    setWeekDays(days);
    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    if (user && weekDays.length > 0) {
      fetchMealPlan();
    }
  }, [user, weekDays]);

  const fetchMealPlan = async () => {
    if (!user || weekDays.length === 0) return;

    setIsLoading(true);
    const weekStart = format(weekDays[0], "yyyy-MM-dd");

    // Get or create meal plan for this week
    let { data: plans } = await supabase
      .from("meal_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .limit(1);

    let planId = plans?.[0]?.id;

    if (!planId) {
      const { data: newPlan } = await supabase
        .from("meal_plans")
        .insert({ user_id: user.id, week_start: weekStart })
        .select("id")
        .single();
      
      planId = newPlan?.id;
    }

    setMealPlanId(planId || null);

    if (planId) {
      const { data: items } = await supabase
        .from("meal_plan_items")
        .select(`
          id,
          day_of_week,
          meal_type,
          custom_meal_name,
          is_prepared,
          is_skipped,
          recipe_id,
          recipes (title)
        `)
        .eq("meal_plan_id", planId);

      setMealItems(items || []);
    }

    setIsLoading(false);
  };

  const toggleMealStatus = async (itemId: string, field: "is_prepared" | "is_skipped", currentValue: boolean) => {
    const { error } = await supabase
      .from("meal_plan_items")
      .update({ [field]: !currentValue })
      .eq("id", itemId);

    if (!error) {
      setMealItems(items => 
        items.map(item => 
          item.id === itemId ? { ...item, [field]: !currentValue } : item
        )
      );
    }
  };

  const handleAutoGenerate = async () => {
    setIsGeneratingWeek(true);
    toast({
      title: "Generating your week...",
      description: "This may take a moment.",
    });

    try {
      // Generate recipes for each meal slot
      for (let day = 0; day < 7; day++) {
        for (const mealType of ["breakfast", "lunch", "dinner"]) {
          const prompt = `Create a healthy ${mealType} for ${format(weekDays[day], "EEEE")}`;
          await generateRecipe(prompt);
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast({
        title: "Week generated! 🎉",
        description: "Your personalized meal plan is ready.",
      });
      
      fetchMealPlan();
    } catch (error) {
      toast({
        title: "Couldn't generate full week",
        description: "Please try again or add meals manually.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingWeek(false);
    }
  };

  const selectedDayOfWeek = weekDays.findIndex(d => 
    format(d, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  const dayMeals = mealItems.filter(item => item.day_of_week === selectedDayOfWeek);

  const getMealForSlot = (slot: string) => {
    return dayMeals.find(item => item.meal_type === slot);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Meal Plan" 
        subtitle={format(new Date(), "MMMM yyyy")}
      />

      <div className="container px-4 py-6 space-y-6">
        {/* AI Generate Button */}
        <Button 
          size="lg" 
          className="w-full h-14 text-lg font-semibold gap-3"
          onClick={handleAutoGenerate}
          disabled={isGeneratingWeek}
        >
          {isGeneratingWeek ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Auto-Generate Week
            </>
          )}
        </Button>

        {/* Quick Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge variant="secondary" className="cursor-pointer whitespace-nowrap px-4 py-2">
            <Clock className="h-4 w-4 mr-1" />
            Low Energy Day
          </Badge>
          <Badge variant="outline" className="cursor-pointer whitespace-nowrap px-4 py-2">
            Heart-Healthy
          </Badge>
          <Badge variant="outline" className="cursor-pointer whitespace-nowrap px-4 py-2">
            High Fiber
          </Badge>
        </div>

        {/* Week Calendar */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weekDays.map((date, index) => {
            const isSelected = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
            const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] h-20 rounded-xl transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : isToday
                    ? "bg-primary/10 text-primary border-2 border-primary"
                    : "bg-card border border-border hover:border-primary/50"
                )}
              >
                <span className="text-sm font-medium">{format(date, "EEE")}</span>
                <span className="text-xl font-bold">{format(date, "d")}</span>
              </button>
            );
          })}
        </div>

        {/* Daily Nutrition Score */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-primary">
              {format(selectedDate, "EEEE")}
            </p>
            <p className="text-sm text-muted-foreground">
              {dayMeals.length > 0 
                ? `${dayMeals.filter(m => m.is_prepared).length} of ${dayMeals.length} meals prepared`
                : "No meals planned yet"}
            </p>
          </div>
        </div>

        {/* Meal Slots */}
        <div className="space-y-3">
          {mealSlots.map((slot) => {
            const meal = getMealForSlot(slot);
            return (
              <Card 
                key={slot}
                className={cn(
                  "transition-all cursor-pointer hover:border-primary/50",
                  meal?.is_prepared && "border-primary bg-primary/5",
                  meal?.is_skipped && "border-muted bg-muted/50 opacity-60"
                )}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                    {mealEmojis[slot]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">{mealLabels[slot]}</p>
                    {meal ? (
                      <p className="font-semibold truncate">
                        {meal.recipes?.title || meal.custom_meal_name || "Unnamed meal"}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        Tap to add meal
                      </p>
                    )}
                  </div>
                  {meal && (
                    <div className="flex gap-2">
                      {!meal.is_prepared && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-10 w-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMealStatus(meal.id, "is_prepared", meal.is_prepared);
                          }}
                        >
                          <Check className="h-5 w-5 text-primary" />
                        </Button>
                      )}
                      {!meal.is_skipped && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-10 w-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMealStatus(meal.id, "is_skipped", meal.is_skipped);
                          }}
                        >
                          <X className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
