import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  Clock, 
  Users,
  Loader2,
  Heart,
  PlayCircle,
  Play
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRecipeGenerator, type GeneratedRecipe } from "@/hooks/useRecipeGenerator";
import { CookingMode } from "@/components/cooking/CookingMode";
import { RecipeDetailDialog } from "@/components/recipes/RecipeDetailDialog";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeReelCard } from "@/components/recipes/RecipeReelCard";
import { RecipeFilters } from "@/components/recipes/RecipeFilters";
import { RecipeSearch } from "@/components/recipes/RecipeSearch";
import { EmptyRecipes } from "@/components/recipes/EmptyRecipes";
import { cn } from "@/lib/utils";

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
}

const filters = ["All", "Favorites", "Under 15 min", "Heart-Healthy", "High Fiber"];

const quickPrompts = [
  { label: "🍳 Quick breakfast", prompt: "A quick 10-minute breakfast that's nutritious and easy" },
  { label: "🥗 Light lunch", prompt: "A light and healthy lunch under 20 minutes" },
  { label: "🍲 Comfort dinner", prompt: "A comforting dinner that's heart-healthy" },
  { label: "🥤 Smoothie", prompt: "A nutritious smoothie packed with vitamins" },
];

export default function Recipes() {
  const { user } = useAuth();
  const { generateRecipe, isGenerating, generatedRecipe, saveRecipe, clearRecipe } = useRecipeGenerator();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [showSavedRecipeDetail, setShowSavedRecipeDetail] = useState(false);
  const [isReelView, setIsReelView] = useState(true);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);

  useEffect(() => {
    fetchRecipes();
  }, [user, activeFilter]);

  const fetchRecipes = async () => {
    if (!user) return;
    
    setIsLoading(true);
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
      setRecipes(data);
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

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reel View - TikTok style full screen scroll
  if (isReelView && filteredRecipes.length > 0 && !isLoading) {
    return (
      <>
        {/* Full screen reel container */}
        <div 
          className="fixed inset-0 bg-black z-40 overflow-hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Reel scroll container */}
          <div 
            className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
            onScroll={(e) => {
              const container = e.currentTarget;
              const index = Math.round(container.scrollTop / container.clientHeight);
              setCurrentReelIndex(index);
            }}
          >
            {filteredRecipes.map((recipe, index) => (
              <div 
                key={recipe.id}
                className="h-full w-full snap-start snap-always flex-shrink-0"
                style={{ height: '100dvh' }}
              >
                <RecipeReelCard
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
                    // TODO: Start cooking mode
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Progress indicator */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-50">
            {filteredRecipes.map((_, index) => (
              <div 
                key={index}
                className={cn(
                  "w-1 rounded-full transition-all duration-300",
                  index === currentReelIndex 
                    ? "h-6 bg-white" 
                    : "h-1.5 bg-white/40"
                )}
              />
            ))}
          </div>
          
          {/* Top bar overlay */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50">
            <h1 className="text-xl font-bold text-white drop-shadow-lg">Recipes</h1>
            <div className="flex items-center gap-2">
              {/* AI Create button */}
              <button
                onClick={() => setShowAIDialog(true)}
                className={cn(
                  "w-10 h-10 rounded-full",
                  "bg-secondary/90 backdrop-blur-md",
                  "flex items-center justify-center",
                  "transition-all duration-200 active:scale-90",
                  "shadow-lg shadow-secondary/30"
                )}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </button>
              {/* Exit reel view */}
              <button
                onClick={() => setIsReelView(false)}
                className={cn(
                  "px-4 py-2 rounded-full",
                  "bg-white/20 backdrop-blur-md text-white text-sm font-medium",
                  "transition-all duration-200 active:scale-95"
                )}
              >
                Grid View
              </button>
            </div>
          </div>
          
          {/* Counter */}
          <div className="absolute top-16 left-4 z-50">
            <span className="text-white/70 text-sm">
              {currentReelIndex + 1} / {filteredRecipes.length}
            </span>
          </div>
        </div>
        
        {/* Dialogs still work */}
        {renderDialogs()}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Recipes" 
        subtitle="Find your next healthy meal"
      />

      <div className="container px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5 animate-fade-in">
        {/* View Toggle + AI Button */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowAIDialog(true)}
            className={cn(
              "flex-1 relative overflow-hidden rounded-2xl p-4",
              "bg-gradient-to-br from-secondary via-secondary/90 to-secondary/70",
              "shadow-lg shadow-secondary/20",
              "transition-all duration-300 active:scale-[0.98]",
              "tap-highlight-none touch-manipulation"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-white">Create with AI</h3>
                <p className="text-xs text-white/80">Personalized recipes</p>
              </div>
            </div>
          </button>
          
          {filteredRecipes.length > 0 && (
            <button
              onClick={() => setIsReelView(true)}
              className={cn(
                "px-4 rounded-2xl",
                "bg-primary/10 text-primary font-medium",
                "transition-all duration-200 active:scale-95",
                "flex items-center gap-2"
              )}
            >
              <Play className="h-4 w-4" />
              Reel
            </button>
          )}
        </div>

        {/* Search */}
        <RecipeSearch 
          value={searchQuery} 
          onChange={setSearchQuery} 
        />

        {/* Filters */}
        <RecipeFilters 
          filters={filters} 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter} 
        />

        {/* Recipe Count */}
        {!isLoading && filteredRecipes.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Recipe List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
            <p className="text-muted-foreground">Loading recipes...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <EmptyRecipes onCreateClick={() => setShowAIDialog(true)} />
        ) : (
          <div className="pb-28">
            {/* Grid layout for recipe cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {filteredRecipes.map((recipe, index) => (
                <div
                  key={recipe.id}
                  className="animate-fade-in"
                  style={{ 
                    animationDelay: `${Math.min(index * 50, 400)}ms`,
                  }}
                >
                  <RecipeCard
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
                    onClick={() => {
                      setSelectedRecipeId(recipe.id);
                      setShowSavedRecipeDetail(true);
                    }}
                    onFavoriteToggle={(e) => {
                      e.stopPropagation();
                      toggleFavorite(recipe.id, recipe.is_favorite);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Recipe Dialog - Modern */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-lg rounded-3xl border-border/50 p-0 overflow-hidden">
          {/* Header with gradient */}
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
              placeholder="Example: A quick heart-healthy dinner with salmon, or a simple breakfast I can prep ahead..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="min-h-[120px] text-base rounded-2xl border-border/50 resize-none focus:ring-secondary/20"
            />
            
            {/* Quick prompts */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Quick ideas</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map(({ label, prompt }) => (
                  <button 
                    key={label}
                    onClick={() => setAiPrompt(prompt)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-sm",
                      "bg-muted/60 hover:bg-muted transition-colors",
                      "active:scale-95 tap-highlight-none"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-lg shadow-secondary/20"
              onClick={handleGenerateRecipe}
              disabled={isGenerating || !aiPrompt.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating your recipe...
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
                {/* Quick Info */}
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {generatedRecipe.prep_time_minutes + generatedRecipe.cook_time_minutes} min total
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {generatedRecipe.servings} servings
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {generatedRecipe.health_tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="rounded-full">{tag}</Badge>
                  ))}
                </div>

                {/* Ingredients */}
                <div className="bg-muted/30 rounded-2xl p-4">
                  <h4 className="font-semibold mb-3">Ingredients</h4>
                  <ul className="space-y-2">
                    {generatedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        <span>
                          <strong>{ing.amount}</strong> {ing.name}
                          {ing.notes && <span className="text-muted-foreground"> ({ing.notes})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
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

                {/* Nutrition */}
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

                {/* Storage */}
                {generatedRecipe.storage_instructions && (
                  <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-3">
                    <strong>💡 Storage:</strong> {generatedRecipe.storage_instructions}
                    {generatedRecipe.freezer_friendly && " ❄️ Freezer-friendly"}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                  <Button 
                    className="w-full h-14 gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
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
                      Save Recipe
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cooking Mode for Generated Recipe */}
      {showCookingMode && generatedRecipe && (
        <CookingMode 
          recipe={generatedRecipe} 
          onClose={() => setShowCookingMode(false)} 
        />
      )}

      {renderDialogs()}
    </div>
  );

  function renderDialogs() {
    return (
      <>
        {/* AI Recipe Dialog - Modern */}
        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogContent className="max-w-lg rounded-3xl border-border/50 p-0 overflow-hidden">
            {/* Header with gradient */}
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
                placeholder="Example: A quick heart-healthy dinner with salmon, or a simple breakfast I can prep ahead..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[120px] text-base rounded-2xl border-border/50 resize-none focus:ring-secondary/20"
              />
              
              {/* Quick prompts */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Quick ideas</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map(({ label, prompt }) => (
                    <button 
                      key={label}
                      onClick={() => setAiPrompt(prompt)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-sm",
                        "bg-muted/60 hover:bg-muted transition-colors",
                        "active:scale-95 tap-highlight-none"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-lg shadow-secondary/20"
                onClick={handleGenerateRecipe}
                disabled={isGenerating || !aiPrompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating your recipe...
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
                  {/* Quick Info */}
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {generatedRecipe.prep_time_minutes + generatedRecipe.cook_time_minutes} min total
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {generatedRecipe.servings} servings
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {generatedRecipe.health_tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="rounded-full">{tag}</Badge>
                    ))}
                  </div>

                  {/* Ingredients */}
                  <div className="bg-muted/30 rounded-2xl p-4">
                    <h4 className="font-semibold mb-3">Ingredients</h4>
                    <ul className="space-y-2">
                      {generatedRecipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                          <span>
                            <strong>{ing.amount}</strong> {ing.name}
                            {ing.notes && <span className="text-muted-foreground"> ({ing.notes})</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
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

                  {/* Nutrition */}
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

                  {/* Storage */}
                  {generatedRecipe.storage_instructions && (
                    <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-3">
                      <strong>💡 Storage:</strong> {generatedRecipe.storage_instructions}
                      {generatedRecipe.freezer_friendly && " ❄️ Freezer-friendly"}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-2">
                    <Button 
                      className="w-full h-14 gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
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
                        Save Recipe
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Cooking Mode for Generated Recipe */}
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
