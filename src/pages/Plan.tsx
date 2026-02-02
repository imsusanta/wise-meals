import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Clock, Check, X, Loader2, Plus, ChevronLeft, ChevronRight, Search, Utensils } from "lucide-react";
import { CalendarDaySkeleton, MealSlotSkeleton } from "@/components/ui/loading-skeletons";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
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
    id: string;
    title: string;
    prep_time_minutes: number;
    health_tags: string[];
  } | null;
}

interface Recipe {
  id: string;
  title: string;
  prep_time_minutes: number;
  health_tags: string[];
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
  const { generateRecipe, isGenerating, clearRecipe } = useRecipeGenerator();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [mealPlanId, setMealPlanId] = useState<string | null>(null);
  const [mealItems, setMealItems] = useState<MealPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingMeal, setIsGeneratingMeal] = useState(false);
  
  // Add meal dialog
  const [showAddMealDialog, setShowAddMealDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; type: string } | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [customMealName, setCustomMealName] = useState("");
  const [isAddingMeal, setIsAddingMeal] = useState(false);

  useEffect(() => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    setWeekDays(days);
  }, [currentWeekStart]);

  useEffect(() => {
    if (user && weekDays.length > 0) {
      fetchMealPlan();
      fetchRecipes();
    }
  }, [user, weekDays]);

  const fetchRecipes = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("recipes")
      .select("id, title, prep_time_minutes, health_tags")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    setRecipes(data || []);
  };

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
          recipes (id, title, prep_time_minutes, health_tags)
        `)
        .eq("meal_plan_id", planId);

      setMealItems(items as MealPlanItem[] || []);
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
      
      if (field === "is_prepared" && !currentValue) {
        toast({
          title: "Meal prepared! 🎉",
          description: "Great job staying on track!",
        });
      }
    }
  };

  const openAddMealDialog = (dayOfWeek: number, mealType: string) => {
    setSelectedSlot({ day: dayOfWeek, type: mealType });
    setShowAddMealDialog(true);
    setRecipeSearch("");
    setCustomMealName("");
  };

  const addMealFromRecipe = async (recipe: Recipe) => {
    if (!mealPlanId || !selectedSlot) return;
    
    setIsAddingMeal(true);
    
    // Check if there's already a meal in this slot
    const existingMeal = mealItems.find(
      item => item.day_of_week === selectedSlot.day && item.meal_type === selectedSlot.type
    );
    
    if (existingMeal) {
      // Update existing
      await supabase
        .from("meal_plan_items")
        .update({ recipe_id: recipe.id, custom_meal_name: null })
        .eq("id", existingMeal.id);
    } else {
      // Insert new
      await supabase
        .from("meal_plan_items")
        .insert({
          meal_plan_id: mealPlanId,
          day_of_week: selectedSlot.day,
          meal_type: selectedSlot.type as "breakfast" | "lunch" | "dinner" | "snack",
          recipe_id: recipe.id,
        });
    }
    
    setShowAddMealDialog(false);
    setIsAddingMeal(false);
    fetchMealPlan();
    
    toast({
      title: "Meal added!",
      description: `${recipe.title} added to your plan.`,
    });
  };

  const addCustomMeal = async () => {
    if (!mealPlanId || !selectedSlot || !customMealName.trim()) return;
    
    setIsAddingMeal(true);
    
    const existingMeal = mealItems.find(
      item => item.day_of_week === selectedSlot.day && item.meal_type === selectedSlot.type
    );
    
    if (existingMeal) {
      await supabase
        .from("meal_plan_items")
        .update({ custom_meal_name: customMealName.trim(), recipe_id: null })
        .eq("id", existingMeal.id);
    } else {
      await supabase
        .from("meal_plan_items")
        .insert({
          meal_plan_id: mealPlanId,
          day_of_week: selectedSlot.day,
          meal_type: selectedSlot.type as "breakfast" | "lunch" | "dinner" | "snack",
          custom_meal_name: customMealName.trim(),
        });
    }
    
    setShowAddMealDialog(false);
    setIsAddingMeal(false);
    setCustomMealName("");
    fetchMealPlan();
    
    toast({
      title: "Meal added!",
      description: `${customMealName} added to your plan.`,
    });
  };

  const generateMealForSlot = async () => {
    if (!selectedSlot || !mealPlanId) return;
    
    setIsGeneratingMeal(true);
    const dayName = format(weekDays[selectedSlot.day], "EEEE");
    const prompt = `Create a healthy ${selectedSlot.type} recipe for ${dayName}. Make it nutritious and delicious.`;
    
    // Use autoSave option to get the saved recipe with id
    const result = await generateRecipe(prompt, { autoSave: true });
    
    if (result && 'id' in result) {
      // Add to meal plan
      await supabase
        .from("meal_plan_items")
        .insert({
          meal_plan_id: mealPlanId,
          day_of_week: selectedSlot.day,
          meal_type: selectedSlot.type as "breakfast" | "lunch" | "dinner" | "snack",
          recipe_id: result.id,
        });
      
      clearRecipe();
      setShowAddMealDialog(false);
      fetchMealPlan();
      fetchRecipes();
      
      toast({
        title: "Recipe created! 🎉",
        description: `${result.title} added to your plan.`,
      });
    }
    
    setIsGeneratingMeal(false);
  };

  const removeMeal = async (itemId: string) => {
    await supabase
      .from("meal_plan_items")
      .delete()
      .eq("id", itemId);
    
    setMealItems(items => items.filter(item => item.id !== itemId));
    
    toast({
      title: "Meal removed",
      description: "The meal has been removed from your plan.",
    });
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
    setSelectedDate(new Date());
  };

  const selectedDayOfWeek = weekDays.findIndex(d => 
    format(d, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  const dayMeals = mealItems.filter(item => item.day_of_week === selectedDayOfWeek);

  const getMealForSlot = (slot: string) => {
    return dayMeals.find(item => item.meal_type === slot);
  };

  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(recipeSearch.toLowerCase())
  );

  const isCurrentWeek = format(currentWeekStart, "yyyy-MM-dd") === format(startOfWeek(new Date(), { weekStartsOn: 0 }), "yyyy-MM-dd");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-28">
        <PageHeader 
          title="Meal Plan" 
          subtitle="Loading..."
        />
        <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5 animate-fade-in max-w-lg mx-auto">
          {/* Week navigation skeleton */}
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 shimmer rounded-xl" />
            <div className="w-24 h-10 shimmer rounded-full" />
            <div className="w-11 h-11 shimmer rounded-xl" />
          </div>
          
          {/* Calendar skeleton */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
            {[...Array(7)].map((_, i) => (
              <CalendarDaySkeleton key={i} />
            ))}
          </div>
          
          {/* Daily summary skeleton */}
          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-muted/50">
            <div className="w-11 h-11 sm:w-12 sm:h-12 shimmer rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 shimmer rounded" />
              <div className="h-4 w-48 shimmer rounded" />
            </div>
          </div>
          
          {/* Meal slots skeleton */}
          <div className="space-y-2.5 sm:space-y-3">
            {[...Array(4)].map((_, i) => (
              <MealSlotSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <PageHeader 
        title="Meal Plan" 
        subtitle={format(currentWeekStart, "MMMM yyyy")}
      />

      <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5 animate-fade-in max-w-lg mx-auto">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousWeek}
            className="h-11 w-11 rounded-xl active:scale-95 tap-highlight-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <button
            onClick={goToCurrentWeek}
            className={cn(
              "px-4 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95 tap-highlight-none touch-manipulation",
              isCurrentWeek 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {isCurrentWeek ? "This Week" : "Go to Today"}
          </button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextWeek}
            className="h-11 w-11 rounded-xl active:scale-95 tap-highlight-none"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Week Calendar - Horizontal Scroll */}
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0 scroll-native">
          {weekDays.map((date, index) => {
            const isSelected = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
            const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            const dayMealCount = mealItems.filter(item => item.day_of_week === index).length;
            const preparedCount = mealItems.filter(item => item.day_of_week === index && item.is_prepared).length;
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 min-w-[44px] sm:min-w-[52px] py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all",
                  "tap-highlight-none touch-manipulation active:scale-95",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : isToday
                    ? "bg-primary/10 text-primary border-2 border-primary"
                    : "bg-card border border-border"
                )}
              >
                <span className="text-[10px] sm:text-xs font-medium opacity-80">{format(date, "EEE")}</span>
                <span className="text-lg sm:text-xl font-bold">{format(date, "d")}</span>
                {dayMealCount > 0 && (
                  <div className="flex gap-0.5 mt-0.5 sm:mt-1">
                    {[...Array(Math.min(dayMealCount, 4))].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full",
                          i < preparedCount 
                            ? isSelected ? "bg-white" : "bg-primary" 
                            : isSelected ? "bg-white/40" : "bg-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Daily Summary */}
        <div className={cn(
          "flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl",
          dayMeals.length > 0 && dayMeals.every(m => m.is_prepared)
            ? "bg-primary/10 border border-primary/20"
            : "bg-muted/50"
        )}>
          <div className={cn(
            "w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            dayMeals.length > 0 && dayMeals.every(m => m.is_prepared)
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}>
            {dayMeals.length > 0 && dayMeals.every(m => m.is_prepared) ? (
              <Check className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm sm:text-base truncate">
              {format(selectedDate, "EEEE, MMM d")}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {dayMeals.length > 0 
                ? `${dayMeals.filter(m => m.is_prepared).length} of ${dayMeals.length} meals prepared`
                : "No meals yet - tap to add"}
            </p>
          </div>
        </div>

        {/* Meal Slots */}
        <div className="space-y-2.5 sm:space-y-3">
          {mealSlots.map((slot) => {
            const meal = getMealForSlot(slot);
            return (
              <Card 
                key={slot}
                onClick={() => !meal && openAddMealDialog(selectedDayOfWeek, slot)}
                className={cn(
                  "transition-all cursor-pointer overflow-hidden",
                  "active:scale-[0.98] tap-highlight-none touch-manipulation",
                  meal?.is_prepared && "border-primary bg-primary/5",
                  meal?.is_skipped && "border-muted bg-muted/50 opacity-60",
                  !meal && "border-dashed hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                  <div className={cn(
                    "w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0",
                    meal ? "bg-muted" : "bg-muted/50"
                  )}>
                    {mealEmojis[slot]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">{mealLabels[slot]}</p>
                    {meal ? (
                      <div>
                        <p className="font-semibold text-sm sm:text-base truncate">
                          {meal.recipes?.title || meal.custom_meal_name || "Unnamed meal"}
                        </p>
                        {meal.recipes?.prep_time_minutes && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            {meal.recipes.prep_time_minutes} min
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-1.5">
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Tap to add
                      </p>
                    )}
                  </div>
                  {meal && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Button 
                        size="icon" 
                        variant={meal.is_prepared ? "default" : "ghost"}
                        className={cn(
                          "h-10 w-10 sm:h-11 sm:w-11 rounded-xl",
                          meal.is_prepared && "bg-primary"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMealStatus(meal.id, "is_prepared", meal.is_prepared);
                        }}
                      >
                        <Check className={cn(
                          "h-4 w-4 sm:h-5 sm:w-5",
                          meal.is_prepared ? "text-white" : "text-primary"
                        )} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMeal(meal.id);
                        }}
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add Meal Dialog - Mobile Optimized */}
      <Dialog open={showAddMealDialog} onOpenChange={setShowAddMealDialog}>
        <DialogContent className="w-[calc(100%-24px)] sm:max-w-md rounded-2xl sm:rounded-3xl p-0 overflow-hidden max-h-[80vh] sm:max-h-[85vh]">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2.5 sm:gap-3 text-lg sm:text-xl">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center text-lg sm:text-xl">
                  {selectedSlot ? mealEmojis[selectedSlot.type] : "🍽️"}
                </div>
                Add {selectedSlot ? mealLabels[selectedSlot.type] : "Meal"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {selectedSlot && weekDays[selectedSlot.day] && 
                  format(weekDays[selectedSlot.day], "EEEE, MMMM d")
                }
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto">
            {/* AI Generate */}
            <Button
              onClick={generateMealForSlot}
              disabled={isGeneratingMeal || isGenerating}
              className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl gap-2.5 sm:gap-3 bg-gradient-to-r from-secondary to-secondary/80 text-sm sm:text-base"
            >
              {isGeneratingMeal || isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                  Generate with AI
                </>
              )}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or choose from recipes</span>
              </div>
            </div>
            
            {/* Search recipes */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                className="pl-10 h-11 sm:h-12 rounded-xl text-sm"
              />
            </div>
            
            {/* Recipe list */}
            <ScrollArea className="h-[160px] sm:h-[200px]">
              {filteredRecipes.length > 0 ? (
                <div className="space-y-1.5 sm:space-y-2">
                  {filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => addMealFromRecipe(recipe)}
                      disabled={isAddingMeal}
                      className={cn(
                        "w-full p-2.5 sm:p-3 rounded-xl text-left transition-colors",
                        "bg-muted/50 hover:bg-muted",
                        "active:scale-[0.98] tap-highlight-none touch-manipulation"
                      )}
                    >
                      <p className="font-medium text-sm sm:text-base truncate">{recipe.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">
                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span>{recipe.prep_time_minutes} min</span>
                        {recipe.health_tags?.[0] && (
                          <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 py-0">
                            {recipe.health_tags[0]}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <p className="text-xs sm:text-sm">No recipes found</p>
                  <p className="text-[10px] sm:text-xs mt-1">Create one with AI above!</p>
                </div>
              )}
            </ScrollArea>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or add custom</span>
              </div>
            </div>
            
            {/* Custom meal input */}
            <div className="flex gap-2">
              <Input
                placeholder="Meal name..."
                value={customMealName}
                onChange={(e) => setCustomMealName(e.target.value)}
                className="h-11 sm:h-12 rounded-xl flex-1 text-sm"
              />
              <Button
                onClick={addCustomMeal}
                disabled={!customMealName.trim() || isAddingMeal}
                className="h-11 sm:h-12 px-5 sm:px-6 rounded-xl text-sm"
              >
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
