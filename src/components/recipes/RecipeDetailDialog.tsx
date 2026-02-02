import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Heart, PlayCircle, Loader2 } from "lucide-react";
import { CookingMode } from "@/components/cooking/CookingMode";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { GeneratedRecipe } from "@/hooks/useRecipeGenerator";

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
  } : null;

  const ingredients = (recipe?.ingredients as GeneratedRecipe["ingredients"]) || [];
  const instructions = (recipe?.instructions as GeneratedRecipe["instructions"]) || [];
  const nutrition = (recipe?.nutrition as GeneratedRecipe["nutrition"]) || null;

  return (
    <>
      <Dialog open={open && !showCookingMode} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recipe ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{recipe.title}</DialogTitle>
                {recipe.description && (
                  <DialogDescription>{recipe.description}</DialogDescription>
                )}
              </DialogHeader>
              
              <div className="space-y-6 pt-4">
                {/* Quick Info */}
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min total
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {recipe.servings || 2} servings
                  </span>
                </div>

                {/* Tags */}
                {recipe.health_tags && recipe.health_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recipe.health_tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Ingredients */}
                {ingredients.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Ingredients</h4>
                    <ul className="space-y-2">
                      {ingredients.map((ing, i) => (
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
                )}

                {/* Instructions */}
                {instructions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Instructions</h4>
                    <ol className="space-y-4">
                      {instructions.map((inst) => (
                        <li key={inst.step} className="flex gap-3">
                          <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                            {inst.step}
                          </span>
                          <span className="pt-0.5">{inst.text}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Nutrition */}
                {nutrition && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Nutrition (per serving)</h4>
                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                      <div>
                        <p className="font-bold text-lg">{nutrition.calories}</p>
                        <p className="text-muted-foreground">Calories</p>
                      </div>
                      <div>
                        <p className="font-bold text-lg">{nutrition.protein_g}g</p>
                        <p className="text-muted-foreground">Protein</p>
                      </div>
                      <div>
                        <p className="font-bold text-lg">{nutrition.fiber_g}g</p>
                        <p className="text-muted-foreground">Fiber</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Storage */}
                {recipe.storage_instructions && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Storage:</strong> {recipe.storage_instructions}
                    {recipe.freezer_friendly && " ❄️ Freezer-friendly"}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                  {instructions.length > 0 && (
                    <Button 
                      className="w-full h-12 gap-2 bg-secondary hover:bg-secondary/90"
                      onClick={() => setShowCookingMode(true)}
                    >
                      <PlayCircle className="h-5 w-5" />
                      Start Cooking
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    className="w-full gap-2"
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
