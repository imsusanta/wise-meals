import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Sparkles, 
  Clock, 
  Users,
  Star,
  Filter,
  Loader2,
  Heart,
  PlayCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRecipeGenerator, type GeneratedRecipe } from "@/hooks/useRecipeGenerator";
import { CookingMode } from "@/components/cooking/CookingMode";
import { RecipeDetailDialog } from "@/components/recipes/RecipeDetailDialog";
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
}

const filters = [
  "All", "Under 15 min", "Heart-Healthy", "Diabetes-Friendly", "High Fiber", "Favorites"
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

  useEffect(() => {
    fetchRecipes();
  }, [user, activeFilter]);

  const fetchRecipes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    let query = supabase
      .from("recipes")
      .select("id, title, description, prep_time_minutes, servings, difficulty, health_tags, is_favorite, is_ai_generated")
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

  const getRecipeEmoji = (tags: string[]) => {
    if (tags.includes("heart-healthy")) return "❤️";
    if (tags.includes("diabetes-friendly")) return "🩺";
    if (tags.includes("vegetarian")) return "🥗";
    if (tags.includes("high-fiber")) return "🌾";
    return "🍽️";
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Recipes" 
        subtitle="Find your next healthy meal"
        showSettings
      />

      <div className="container px-4 py-6 space-y-6">
        {/* AI Recipe Generator */}
        <Button 
          size="lg" 
          className="w-full h-14 text-lg font-semibold gap-3 bg-secondary hover:bg-secondary/90"
          onClick={() => setShowAIDialog(true)}
        >
          <Sparkles className="h-5 w-5" />
          Create Recipe with AI
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button variant="outline" size="sm" className="shrink-0">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          {filters.map((filter) => (
            <Badge
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap px-4 py-2"
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>

        {/* Recipe Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No recipes yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first recipe with AI or browse suggestions.
            </p>
            <Button onClick={() => setShowAIDialog(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Create Recipe
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRecipes.map((recipe) => (
              <Card 
                key={recipe.id}
                className="overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                onClick={() => {
                  setSelectedRecipeId(recipe.id);
                  setShowSavedRecipeDetail(true);
                }}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Recipe Emoji */}
                    <div className="w-28 h-28 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-5xl shrink-0">
                      {getRecipeEmoji(recipe.health_tags)}
                    </div>
                    
                    {/* Recipe Info */}
                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {recipe.title}
                        </h3>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="shrink-0 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(recipe.id, recipe.is_favorite);
                          }}
                        >
                          <Heart 
                            className={cn(
                              "h-5 w-5 transition-all",
                              recipe.is_favorite ? "fill-destructive text-destructive scale-110" : "text-muted-foreground"
                            )} 
                          />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {recipe.prep_time_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {recipe.servings}
                        </span>
                        <span className="flex items-center gap-1">
                          {[...Array(3)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "h-3 w-3",
                                i < recipe.difficulty ? "fill-secondary text-secondary" : "text-muted"
                              )}
                            />
                          ))}
                        </span>
                      </div>
                      
                      <div className="flex gap-1 flex-wrap">
                        {recipe.health_tags.slice(0, 2).map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {recipe.is_ai_generated && (
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* AI Recipe Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-secondary" />
              Create Recipe with AI
            </DialogTitle>
            <DialogDescription>
              Describe what you'd like to eat and we'll create a personalized recipe based on your health profile.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <Textarea
              placeholder="Example: A quick heart-healthy dinner with salmon, or a simple breakfast I can prep ahead..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="min-h-[120px] text-base"
            />
            
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => setAiPrompt("A quick 15-minute lunch that's heart-healthy")}
              >
                Quick lunch
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => setAiPrompt("A comforting dinner soup that's low in sodium")}
              >
                Comfort soup
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => setAiPrompt("An easy breakfast I can make ahead for the week")}
              >
                Make-ahead breakfast
              </Badge>
            </div>

            <Button 
              className="w-full h-12"
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>

                {/* Ingredients */}
                <div>
                  <h4 className="font-semibold mb-3">Ingredients</h4>
                  <ul className="space-y-2">
                    {generatedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
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
                        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                          {inst.step}
                        </span>
                        <span className="pt-0.5">{inst.text}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Nutrition */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Nutrition (per serving)</h4>
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div>
                      <p className="font-bold text-lg">{generatedRecipe.nutrition.calories}</p>
                      <p className="text-muted-foreground">Calories</p>
                    </div>
                    <div>
                      <p className="font-bold text-lg">{generatedRecipe.nutrition.protein_g}g</p>
                      <p className="text-muted-foreground">Protein</p>
                    </div>
                    <div>
                      <p className="font-bold text-lg">{generatedRecipe.nutrition.fiber_g}g</p>
                      <p className="text-muted-foreground">Fiber</p>
                    </div>
                  </div>
                </div>

                {/* Storage */}
                {generatedRecipe.storage_instructions && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Storage:</strong> {generatedRecipe.storage_instructions}
                    {generatedRecipe.freezer_friendly && " ❄️ Freezer-friendly"}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                  <Button 
                    className="w-full h-12 gap-2 bg-secondary hover:bg-secondary/90"
                    onClick={() => setShowCookingMode(true)}
                  >
                    <PlayCircle className="h-5 w-5" />
                    Start Cooking
                  </Button>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowRecipeDetail(false);
                        clearRecipe();
                      }}
                    >
                      Discard
                    </Button>
                    <Button 
                      className="flex-1"
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
    </div>
  );
}
