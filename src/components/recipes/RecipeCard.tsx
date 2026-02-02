import { Heart, Clock, Users, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  id: string;
  title: string;
  description?: string | null;
  prepTime: number;
  servings: number;
  difficulty: number;
  healthTags: string[];
  isFavorite: boolean;
  isAiGenerated: boolean;
  onClick: () => void;
  onFavoriteToggle: (e: React.MouseEvent) => void;
}

const getRecipeGradient = (tags: string[]) => {
  if (tags.includes("heart-healthy")) return "from-rose-500/20 via-rose-400/10 to-rose-300/5";
  if (tags.includes("diabetes-friendly")) return "from-blue-500/20 via-blue-400/10 to-blue-300/5";
  if (tags.includes("vegetarian")) return "from-green-500/20 via-green-400/10 to-green-300/5";
  if (tags.includes("high-fiber")) return "from-amber-500/20 via-amber-400/10 to-amber-300/5";
  if (tags.includes("anti-inflammatory")) return "from-purple-500/20 via-purple-400/10 to-purple-300/5";
  return "from-primary/20 via-primary/10 to-primary/5";
};

const getRecipeEmoji = (tags: string[]) => {
  if (tags.includes("heart-healthy")) return "❤️";
  if (tags.includes("diabetes-friendly")) return "💙";
  if (tags.includes("vegetarian") || tags.includes("vegan")) return "🥗";
  if (tags.includes("high-fiber")) return "🌾";
  if (tags.includes("anti-inflammatory")) return "✨";
  if (tags.includes("bone-health")) return "🦴";
  return "🍽️";
};

export function RecipeCard({
  title,
  description,
  prepTime,
  servings,
  difficulty,
  healthTags,
  isFavorite,
  isAiGenerated,
  onClick,
  onFavoriteToggle,
}: RecipeCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-3xl",
        "bg-gradient-to-br",
        getRecipeGradient(healthTags),
        "border border-border/40 hover:border-primary/30",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:shadow-primary/5",
        "active:scale-[0.98] cursor-pointer",
        "tap-highlight-none"
      )}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative p-5">
        <div className="flex gap-4">
          {/* Emoji Icon */}
          <div className="shrink-0 w-16 h-16 rounded-2xl bg-background/80 backdrop-blur flex items-center justify-center text-3xl shadow-sm border border-border/20">
            {getRecipeEmoji(healthTags)}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground">
                {title}
              </h3>
              <button
                onClick={onFavoriteToggle}
                className={cn(
                  "shrink-0 p-2 -m-2 rounded-full transition-all duration-200",
                  "hover:bg-background/50 active:scale-90",
                  isFavorite && "animate-pulse-ring"
                )}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart 
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isFavorite 
                      ? "fill-destructive text-destructive scale-110" 
                      : "text-muted-foreground hover:text-destructive"
                  )} 
                />
              </button>
            </div>
            
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {description}
              </p>
            )}
            
            {/* Meta Info */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{prepTime} min</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span className="font-medium">{servings}</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="flex items-center gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors",
                      i < difficulty ? "bg-secondary" : "bg-muted"
                    )}
                  />
                ))}
              </span>
            </div>
            
            {/* Tags */}
            <div className="flex gap-1.5 flex-wrap">
              {healthTags.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs font-medium px-2.5 py-0.5 bg-background/70 backdrop-blur-sm border-0"
                >
                  {tag}
                </Badge>
              ))}
              {isAiGenerated && (
                <Badge 
                  variant="outline" 
                  className="text-xs font-medium px-2.5 py-0.5 bg-secondary/10 border-secondary/20 text-secondary"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
    </div>
  );
}
