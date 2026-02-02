import { Sparkles, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyRecipesProps {
  onCreateClick: () => void;
}

export function EmptyRecipes({ onCreateClick }: EmptyRecipesProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <ChefHat className="h-12 w-12 text-primary" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center animate-pulse">
          <Sparkles className="h-5 w-5 text-secondary" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-2">No recipes yet</h3>
      <p className="text-muted-foreground mb-6 max-w-[280px]">
        Create your first personalized recipe with AI based on your health profile.
      </p>
      
      <Button 
        size="lg" 
        onClick={onCreateClick}
        className="gap-2 h-14 px-8 rounded-2xl bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-lg shadow-secondary/25"
      >
        <Sparkles className="h-5 w-5" />
        Create Recipe with AI
      </Button>
    </div>
  );
}
