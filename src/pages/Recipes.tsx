import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  Clock, 
  Users,
  Loader2,
  ChevronUp,
  ChevronDown,
  Search,
  X,
  PlayCircle,
  Heart,
  CalendarDays
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRecipeGenerator, type GeneratedRecipe } from "@/hooks/useRecipeGenerator";
import { CookingMode } from "@/components/cooking/CookingMode";
import { RecipeDetailDialog } from "@/components/recipes/RecipeDetailDialog";
import { CompactReelCard } from "@/components/recipes/CompactReelCard";
import { EmptyRecipes } from "@/components/recipes/EmptyRecipes";
import { RecipeReelSkeleton } from "@/components/ui/loading-skeletons";
import { cn } from "@/lib/utils";
import { format, startOfWeek } from "date-fns";

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  prep_time_minutes: number;
  servings: number;
  difficulty: number;
  health_tags: string[];
  is_favorite: boolean;
  is_ai_generated: boolean;
  image_url: string | null;
  isPlannedToday?: boolean;
}

const filters = ["All", "Favorites", "Under 15 min", "Heart-Healthy"];

const quickPrompts = [
  { label: "🍳 Quick breakfast", prompt: "A quick 10-minute breakfast that's nutritious and easy" },
  { label: "🥗 Light lunch", prompt: "A light and healthy lunch under 20 minutes" },
  { label: "🍲 Comfort dinner", prompt: "A comforting dinner that's heart-healthy" },
  { label: "🥤 Smoothie", prompt: "A nutritious smoothie packed with vitamins" },
];

export default function Recipes() {
  const { user } = useAuth();
  const { generateRecipe, isGenerating, generatedRecipe, saveRecipe, clearRecipe } = useRecipeGenerator();
  const [activeFilter, setActiveFilter] = useState("All");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [showSavedRecipeDetail, setShowSavedRecipeDetail] = useState(false);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const reelContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecipes();
  }, [user, activeFilter]);

  const fetchRecipes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    // First, get today's planned recipe IDs
    const todayStr = format(new Date(), "yyyy-MM-dd");
    let todayRecipeIds: string[] = [];
    
    // Try date-specific first
    const { data: dateItems } = await supabase
      .from("meal_plan_items")
      .select(`recipe_id, meal_plans!inner (user_id)`)
      .eq("planned_date", todayStr)
      .eq("meal_plans.user_id", user.id)
      .not("recipe_id", "is", null);
    
    if (dateItems && dateItems.length > 0) {
      todayRecipeIds = dateItems.map(item => item.recipe_id).filter(Boolean) as string[];
    } else {
      // Fallback: Legacy day_of_week system
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const dayOfWeek = Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      const weekStartStr = format(weekStart, "yyyy-MM-dd");
      
      const { data: plans } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("week_start", weekStartStr)
        .limit(1);
      
      if (plans && plans.length > 0) {
        const { data: legacyItems } = await supabase
          .from("meal_plan_items")
          .select("recipe_id")
          .eq("meal_plan_id", plans[0].id)
          .eq("day_of_week", dayOfWeek)
          .not("recipe_id", "is", null);
        
        if (legacyItems) {
          todayRecipeIds = legacyItems.map(item => item.recipe_id).filter(Boolean) as string[];
        }
      }
    }
    
    // Now fetch all recipes
    let query = supabase
      .from("recipes")
      .select("id, title, description, prep_time_minutes, servings, difficulty, health_tags, is_favorite, is_ai_generated, image_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (activeFilter === "Favorites") {
      query = query.eq("is_favorite", true);
    } else if (activeFilter === "Under 15 min") {
      query = query.lte("prep_time_minutes", 15);
    } else if (activeFilter !== "All") {
      query = query.contains("health_tags", [activeFilter.toLowerCase().replace(" ", "-")]);
    }

    const { data, error } = await query;
    
    if (!error && data) {
      // Mark planned recipes and sort them first
      const recipesWithPlanned = data.map(recipe => ({
        ...recipe,
        isPlannedToday: todayRecipeIds.includes(recipe.id)
      }));
      
      // Sort: today's planned meals first, then by created_at (already sorted)
      recipesWithPlanned.sort((a, b) => {
        if (a.isPlannedToday && !b.isPlannedToday) return -1;
        if (!a.isPlannedToday && b.isPlannedToday) return 1;
        return 0;
      });
      
      setRecipes(recipesWithPlanned);
    }
    setIsLoading(false);
  };

  const handleGenerateRecipe = async () => {
    if (!aiPrompt.trim()) return;
    
    const recipe = await generateRecipe(aiPrompt);
    if (recipe) {
      setShowRecipeDetail(true);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;
    
    const saved = await saveRecipe(generatedRecipe);
    if (saved) {
      setShowAIDialog(false);
      setShowRecipeDetail(false);
      setAiPrompt("");
      clearRecipe();
      fetchRecipes();
    }
  };

  const toggleFavorite = async (recipeId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("recipes")
      .update({ is_favorite: !currentStatus })
      .eq("id", recipeId);

    if (!error) {
      setRecipes(recipes.map(r => 
        r.id === recipeId ? { ...r, is_favorite: !currentStatus } : r
      ));
    }
  };

  const scrollToIndex = (index: number) => {
    if (reelContainerRef.current && index >= 0 && index < recipes.length) {
      const container = reelContainerRef.current;
      container.scrollTo({
        top: index * container.clientHeight,
        behavior: 'smooth'
      });
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div 
        className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted z-40 overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <RecipeReelSkeleton />
      </div>
    );
  }

  // Empty State
  if (recipes.length === 0) {
    return (
      <div className="fixed inset-0 bg-background z-40 flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-border/50">
          <h1 className="text-xl font-bold">Recipes</h1>
          <button
            onClick={() => setShowAIDialog(true)}
            className={cn(
              "w-10 h-10 rounded-full",
              "bg-secondary",
              "flex items-center justify-center",
              "transition-all duration-200 active:scale-90",
              "shadow-lg shadow-secondary/30"
            )}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <EmptyRecipes onCreateClick={() => setShowAIDialog(true)} />
        </div>
        
        {renderDialogs()}
      </div>
    );
  }

  // Reel View - Compact cards with swipe
  return (
    <>
      <div 
        className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/50 z-40 overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Reel scroll container */}
        <div 
          ref={reelContainerRef}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
          onScroll={(e) => {
            const container = e.currentTarget;
            const index = Math.round(container.scrollTop / container.clientHeight);
            setCurrentReelIndex(index);
          }}
        >
          {recipes.map((recipe) => (
            <div 
              key={recipe.id}
              className="h-full w-full snap-start snap-always flex-shrink-0"
              style={{ height: '100dvh' }}
            >
              <CompactReelCard
                id={recipe.id}
                title={recipe.title}
                description={recipe.description}
                prepTime={recipe.prep_time_minutes}
                servings={recipe.servings}
                difficulty={recipe.difficulty}
                healthTags={recipe.health_tags}
                isFavorite={recipe.is_favorite}
                isAiGenerated={recipe.is_ai_generated}
                imageUrl={recipe.image_url}
                isPlannedToday={recipe.isPlannedToday}
                onClick={() => {
                  setSelectedRecipeId(recipe.id);
                  setShowSavedRecipeDetail(true);
                }}
                onFavoriteToggle={(e) => {
                  e.stopPropagation();
                  toggleFavorite(recipe.id, recipe.is_favorite);
                }}
                onStartCooking={() => {
                  setSelectedRecipeId(recipe.id);
                  setShowSavedRecipeDetail(true);
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Progress dots on right */}
        {recipes.length > 1 && recipes.length <= 10 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
            {recipes.map((_, index) => (
              <button 
                key={index}
                onClick={() => scrollToIndex(index)}
                className={cn(
                  "w-2 rounded-full transition-all duration-300",
                  index === currentReelIndex 
                    ? "h-6 bg-primary" 
                    : "h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        )}
        
        {/* Top bar overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] flex items-center justify-between z-50">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">Recipes</h1>
            <span className="text-sm text-muted-foreground">
              {currentReelIndex + 1}/{recipes.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-3 py-2 rounded-full text-sm font-medium",
                "bg-muted/80 backdrop-blur-md",
                "transition-all duration-200 active:scale-95",
                showFilters && "bg-primary text-primary-foreground"
              )}
            >
              {activeFilter === "All" ? "Filter" : activeFilter}
            </button>
            
            {/* AI Create button */}
            <button
              onClick={() => setShowAIDialog(true)}
              className={cn(
                "w-10 h-10 rounded-full",
                "bg-secondary",
                "flex items-center justify-center",
                "transition-all duration-200 active:scale-90",
                "shadow-lg shadow-secondary/30"
              )}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Filter dropdown */}
        {showFilters && (
          <div className="absolute top-20 left-4 right-4 z-50 animate-fade-in">
            <div className="bg-card/95 backdrop-blur-xl rounded-2xl p-3 shadow-xl border border-border/50">
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter);
                      setShowFilters(false);
                      setCurrentReelIndex(0);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      activeFilter === filter
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation hints */}
        {recipes.length > 1 && (
          <>
            {currentReelIndex > 0 && (
              <button
                onClick={() => scrollToIndex(currentReelIndex - 1)}
                className="absolute top-24 left-1/2 -translate-x-1/2 z-40 p-2 rounded-full bg-muted/50 backdrop-blur-sm animate-bounce"
              >
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            {currentReelIndex < recipes.length - 1 && (
              <button
                onClick={() => scrollToIndex(currentReelIndex + 1)}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 p-2 rounded-full bg-muted/50 backdrop-blur-sm animate-bounce"
              >
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </>
        )}
      </div>
      
      {renderDialogs()}
    </>
  );

  function renderDialogs() {
    return (
      <>
        {/* AI Recipe Dialog */}
        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogContent className="max-w-lg rounded-3xl border-border/50 p-0 overflow-hidden">
            <div className="bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent p-6 pb-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-secondary" />
                  </div>
                  Create Recipe with AI
                </DialogTitle>
                <DialogDescription className="text-base">
                  Describe what you'd like to eat and we'll create a personalized recipe.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-6 pt-2 space-y-5">
              <Textarea
                placeholder="Example: A quick heart-healthy dinner with salmon..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[120px] text-base rounded-2xl border-border/50 resize-none"
              />
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Quick ideas</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map(({ label, prompt }) => (
                    <button 
                      key={label}
                      onClick={() => setAiPrompt(prompt)}
                      className="px-3 py-2 rounded-xl text-sm bg-muted/60 hover:bg-muted transition-colors active:scale-95"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-secondary to-secondary/80"
                onClick={handleGenerateRecipe}
                disabled={isGenerating || !aiPrompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Recipe
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Generated Recipe Detail */}
        <Dialog open={showRecipeDetail && !!generatedRecipe} onOpenChange={setShowRecipeDetail}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl">
            {generatedRecipe && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{generatedRecipe.title}</DialogTitle>
                  <DialogDescription>{generatedRecipe.description}</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 pt-4">
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {generatedRecipe.prep_time_minutes + generatedRecipe.cook_time_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {generatedRecipe.servings} servings
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {generatedRecipe.health_tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Ingredients</h4>
                    <ul className="space-y-2">
                      {generatedRecipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          <span>
                            <strong>{ing.amount}</strong> {ing.name}
                            {ing.notes && <span className="text-muted-foreground"> ({ing.notes})</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Instructions</h4>
                    <ol className="space-y-4">
                      {generatedRecipe.instructions.map((inst) => (
                        <li key={inst.step} className="flex gap-3">
                          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                            {inst.step}
                          </span>
                          <span className="pt-1">{inst.text}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-4">
                    <h4 className="font-semibold mb-3">Nutrition (per serving)</h4>
                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                      <div className="bg-background/60 rounded-xl p-3">
                        <p className="font-bold text-xl text-primary">{generatedRecipe.nutrition.calories}</p>
                        <p className="text-muted-foreground text-xs">Calories</p>
                      </div>
                      <div className="bg-background/60 rounded-xl p-3">
                        <p className="font-bold text-xl text-secondary">{generatedRecipe.nutrition.protein_g}g</p>
                        <p className="text-muted-foreground text-xs">Protein</p>
                      </div>
                      <div className="bg-background/60 rounded-xl p-3">
                        <p className="font-bold text-xl text-accent">{generatedRecipe.nutrition.fiber_g}g</p>
                        <p className="text-muted-foreground text-xs">Fiber</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <Button 
                      className="w-full h-14 gap-2 rounded-2xl"
                      onClick={() => setShowCookingMode(true)}
                    >
                      <PlayCircle className="h-5 w-5" />
                      Start Cooking
                    </Button>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1 h-12 rounded-xl"
                        onClick={() => {
                          setShowRecipeDetail(false);
                          clearRecipe();
                        }}
                      >
                        Discard
                      </Button>
                      <Button 
                        className="flex-1 h-12 rounded-xl"
                        onClick={handleSaveRecipe}
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Cooking Mode */}
        {showCookingMode && generatedRecipe && (
          <CookingMode 
            recipe={generatedRecipe} 
            onClose={() => setShowCookingMode(false)} 
          />
        )}

        {/* Saved Recipe Detail Dialog */}
        <RecipeDetailDialog
          recipeId={selectedRecipeId}
          open={showSavedRecipeDetail}
          onOpenChange={(open) => {
            setShowSavedRecipeDetail(open);
            if (!open) setSelectedRecipeId(null);
          }}
          onFavoriteChange={(recipeId, isFavorite) => {
            setRecipes(recipes.map(r => 
              r.id === recipeId ? { ...r, is_favorite: isFavorite } : r
            ));
          }}
        />
      </>
    );
  }
}
