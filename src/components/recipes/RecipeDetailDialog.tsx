import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Heart, PlayCircle, Loader2, Sparkles } from "lucide-react";
import { CookingMode } from "@/components/cooking/CookingMode";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { GeneratedRecipe } from "@/hooks/useRecipeGenerator";

function HeroImage({ 
  src, 
  alt, 
  children 
}: { 
  src: string; 
  alt: string; 
  children?: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full aspect-[16/10] overflow-hidden rounded-t-3xl">
      {/* Shimmer skeleton */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 shimmer" />
      )}
      
      {/* Actual image */}
      {!hasError && (
        <img 
          src={src} 
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
      
      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 text-muted-foreground text-6xl">
          🍽️
        </div>
      )}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      
      {children}
    </div>
  );
}

interface SavedRecipe {
  id: string;
  title: string;
  description: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  difficulty: number | null;
  health_tags: string[] | null;
  is_favorite: boolean | null;
  ingredients: unknown;
  instructions: unknown;
  nutrition: unknown;
  storage_instructions: string | null;
  freezer_friendly: boolean | null;
  image_url: string | null;
  is_ai_generated: boolean | null;
}

interface RecipeDetailDialogProps {
  recipeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFavoriteChange?: (recipeId: string, isFavorite: boolean) => void;
}

export function RecipeDetailDialog({ 
  recipeId, 
  open, 
  onOpenChange,
  onFavoriteChange 
}: RecipeDetailDialogProps) {
  const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  useEffect(() => {
    if (recipeId && open) {
      fetchRecipe(recipeId);
    }
  }, [recipeId, open]);

  const fetchRecipe = async (id: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setRecipe(data);
    }
    setIsLoading(false);
  };

  const toggleFavorite = async () => {
    if (!recipe) return;
    
    setIsFavoriting(true);
    const newStatus = !recipe.is_favorite;
    
    const { error } = await supabase
      .from("recipes")
      .update({ is_favorite: newStatus })
      .eq("id", recipe.id);

    if (!error) {
      setRecipe({ ...recipe, is_favorite: newStatus });
      onFavoriteChange?.(recipe.id, newStatus);
    }
    setIsFavoriting(false);
  };

  // Convert saved recipe to GeneratedRecipe format for CookingMode
  const recipeForCooking: GeneratedRecipe | null = recipe ? {
    title: recipe.title,
    description: recipe.description || "",
    prep_time_minutes: recipe.prep_time_minutes || 0,
    cook_time_minutes: recipe.cook_time_minutes || 0,
    servings: recipe.servings || 2,
    difficulty: recipe.difficulty || 2,
    ingredients: (recipe.ingredients as GeneratedRecipe["ingredients"]) || [],
    instructions: (recipe.instructions as GeneratedRecipe["instructions"]) || [],
    nutrition: (recipe.nutrition as GeneratedRecipe["nutrition"]) || {
      calories: 0, protein_g: 0, fiber_g: 0, sodium_mg: 0, calcium_mg: 0
    },
    health_tags: recipe.health_tags || [],
    storage_instructions: recipe.storage_instructions || "",
    freezer_friendly: recipe.freezer_friendly || false,
    image_url: recipe.image_url || undefined,
  } : null;

  const ingredients = (recipe?.ingredients as GeneratedRecipe["ingredients"]) || [];
  const instructions = (recipe?.instructions as GeneratedRecipe["instructions"]) || [];
  const nutrition = (recipe?.nutrition as GeneratedRecipe["nutrition"]) || null;

  return (
    <>
      <Dialog open={open && !showCookingMode} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recipe ? (
            <>
              {/* Hero Image */}
              {recipe.image_url ? (
                <HeroImage src={recipe.image_url} alt={recipe.title}>
                  {/* AI Badge */}
                  {recipe.is_ai_generated && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-secondary/90 backdrop-blur-sm text-secondary-foreground border-0 gap-1 px-3 py-1">
                        <Sparkles className="h-3 w-3" />
                        AI Generated
                      </Badge>
                    </div>
                  )}
                  
                  {/* Favorite button overlay */}
                  <button
                    onClick={toggleFavorite}
                    disabled={isFavoriting}
                    className={cn(
                      "absolute top-4 right-4 z-10 w-10 h-10 rounded-full",
                      "bg-background/80 backdrop-blur-sm",
                      "flex items-center justify-center",
                      "transition-all duration-200 active:scale-90",
                      "border border-border/30"
                    )}
                  >
                    <Heart 
                      className={cn(
                        "h-5 w-5 transition-all",
                        recipe.is_favorite 
                          ? "fill-destructive text-destructive" 
                          : "text-muted-foreground"
                      )} 
                    />
                  </button>
                  
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                      {recipe.title}
                    </h2>
                    {recipe.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}
                  </div>
                </HeroImage>
              ) : (
                <DialogHeader className="p-6 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <DialogTitle className="text-xl">{recipe.title}</DialogTitle>
                      {recipe.description && (
                        <DialogDescription className="mt-1">{recipe.description}</DialogDescription>
                      )}
                    </div>
                    {recipe.is_ai_generated && (
                      <Badge className="bg-secondary/20 text-secondary border-0 gap-1 shrink-0">
                        <Sparkles className="h-3 w-3" />
                        AI
                      </Badge>
                    )}
                  </div>
                </DialogHeader>
              )}
              
              <div className={cn(
                "space-y-5",
                recipe.image_url ? "p-5 pt-3" : "p-6 pt-4"
              )}>
                {/* Quick Info */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{recipe.servings || 2} servings</span>
                  </div>
                </div>

                {/* Tags */}
                {recipe.health_tags && recipe.health_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recipe.health_tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="rounded-full px-3 py-1 font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Ingredients */}
                {ingredients.length > 0 && (
                  <div className="bg-muted/30 rounded-2xl p-4">
                    <h4 className="font-bold mb-3">Ingredients</h4>
                    <ul className="space-y-2">
                      {ingredients.map((ing, i) => (
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
                )}

                {/* Instructions */}
                {instructions.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-3">Instructions</h4>
                    <ol className="space-y-4">
                      {instructions.map((inst) => (
                        <li key={inst.step} className="flex gap-3">
                          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                            {inst.step}
                          </span>
                          <span className="pt-1">{inst.text}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Nutrition */}
                {nutrition && (
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-4">
                    <h4 className="font-bold mb-3">Nutrition (per serving)</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-background/60 rounded-xl p-3">
                        <p className="font-bold text-xl text-primary">{nutrition.calories}</p>
                        <p className="text-muted-foreground text-xs">Calories</p>
                      </div>
                      <div className="bg-background/60 rounded-xl p-3">
                        <p className="font-bold text-xl text-secondary">{nutrition.protein_g}g</p>
                        <p className="text-muted-foreground text-xs">Protein</p>
                      </div>
                      <div className="bg-background/60 rounded-xl p-3">
                        <p className="font-bold text-xl text-accent">{nutrition.fiber_g}g</p>
                        <p className="text-muted-foreground text-xs">Fiber</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Storage */}
                {recipe.storage_instructions && (
                  <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-3">
                    <strong>💡 Storage:</strong> {recipe.storage_instructions}
                    {recipe.freezer_friendly && " ❄️ Freezer-friendly"}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                  {instructions.length > 0 && (
                    <Button 
                      className={cn(
                        "w-full h-14 gap-2 rounded-2xl text-base font-bold",
                        "bg-gradient-to-r from-secondary to-secondary/80",
                        "hover:from-secondary/90 hover:to-secondary/70",
                        "shadow-lg shadow-secondary/20"
                      )}
                      onClick={() => setShowCookingMode(true)}
                    >
                      <PlayCircle className="h-5 w-5" />
                      Start Cooking
                    </Button>
                  )}
                  {!recipe.image_url && (
                    <Button 
                      variant="outline"
                      className="w-full h-12 gap-2 rounded-xl"
                      onClick={toggleFavorite}
                      disabled={isFavoriting}
                    >
                      <Heart 
                        className={cn(
                          "h-4 w-4",
                          recipe.is_favorite && "fill-destructive text-destructive"
                        )} 
                      />
                      {recipe.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Recipe not found
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cooking Mode */}
      {showCookingMode && recipeForCooking && (
        <CookingMode 
          recipe={recipeForCooking} 
          onClose={() => setShowCookingMode(false)} 
        />
      )}
    </>
  );
}
