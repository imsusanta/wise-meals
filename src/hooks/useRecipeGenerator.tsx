import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useProfile } from "./useProfile";

export interface GeneratedRecipe {
  title: string;
  description: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty: number;
  ingredients: Array<{ name: string; amount: string; notes?: string }>;
  instructions: Array<{ step: number; text: string; time_minutes?: number }>;
  nutrition: {
    calories: number;
    protein_g: number;
    fiber_g: number;
    sodium_mg: number;
    calcium_mg: number;
  };
  health_tags: string[];
  storage_instructions: string;
  freezer_friendly: boolean;
}

export function useRecipeGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const { toast } = useToast();
  const { profile } = useProfile();

  const generateRecipe = async (prompt: string, options?: {
    servings?: number;
    max_prep_time?: number;
    autoSave?: boolean;
  }) => {
    setIsGenerating(true);
    setGeneratedRecipe(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-recipe", {
        body: {
          prompt,
          dietary_restrictions: profile?.dietary_restrictions || [],
          allergies: profile?.allergies || [],
          servings: options?.servings || (profile?.household_size === "1" ? 1 : 2),
          max_prep_time: options?.max_prep_time,
          cooking_skill: profile?.cooking_skill || "comfortable",
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const recipe = data.recipe as GeneratedRecipe;
      setGeneratedRecipe(recipe);

      // Auto-save if requested
      if (options?.autoSave) {
        const saved = await saveRecipeInternal(recipe);
        if (saved) {
          toast({
            title: "Recipe saved!",
            description: `"${recipe.title}" has been added to your recipes.`,
          });
          return saved;
        }
      }

      return recipe;
    } catch (error) {
      console.error("Recipe generation error:", error);
      toast({
        title: "Couldn't create recipe",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveRecipeInternal = async (recipe: GeneratedRecipe) => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .insert({
          title: recipe.title,
          description: recipe.description,
          prep_time_minutes: recipe.prep_time_minutes,
          cook_time_minutes: recipe.cook_time_minutes,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          nutrition: recipe.nutrition,
          health_tags: recipe.health_tags,
          storage_instructions: recipe.storage_instructions,
          freezer_friendly: recipe.freezer_friendly,
          is_ai_generated: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Save recipe error:", error);
      return null;
    }
  };

  const saveRecipe = async (recipe: GeneratedRecipe) => {
    const saved = await saveRecipeInternal(recipe);
    if (saved) {
      toast({
        title: "Recipe saved!",
        description: "You can find it in your Recipes.",
      });
    } else {
      toast({
        title: "Couldn't save recipe",
        description: "Please try again.",
        variant: "destructive",
      });
    }
    return saved;
  };

  return {
    isGenerating,
    generatedRecipe,
    generateRecipe,
    saveRecipe,
    clearRecipe: () => setGeneratedRecipe(null),
  };
}
