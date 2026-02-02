import { useState } from "react";
import { Heart, Clock, Users, Sparkles, ChefHat } from "lucide-react";
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
  imageUrl?: string | null;
  onClick: () => void;
  onFavoriteToggle: (e: React.MouseEvent) => void;
  index?: number;
  totalCards?: number;
}

const getRecipeAccent = (tags: string[]) => {
  if (tags.includes("heart-healthy")) return { bg: "bg-rose-500", text: "text-rose-500", gradient: "from-rose-500/30" };
  if (tags.includes("diabetes-friendly")) return { bg: "bg-blue-500", text: "text-blue-500", gradient: "from-blue-500/30" };
  if (tags.includes("vegetarian")) return { bg: "bg-emerald-500", text: "text-emerald-500", gradient: "from-emerald-500/30" };
  if (tags.includes("high-fiber")) return { bg: "bg-amber-500", text: "text-amber-500", gradient: "from-amber-500/30" };
  if (tags.includes("anti-inflammatory")) return { bg: "bg-purple-500", text: "text-purple-500", gradient: "from-purple-500/30" };
  return { bg: "bg-primary", text: "text-primary", gradient: "from-primary/30" };
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

const getDifficultyLabel = (difficulty: number) => {
  if (difficulty <= 1) return "Easy";
  if (difficulty === 2) return "Medium";
  return "Hard";
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
  imageUrl,
  onClick,
  onFavoriteToggle,
}: RecipeCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const accent = getRecipeAccent(healthTags);
  const hasImage = imageUrl && !imageError;
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl sm:rounded-2xl",
        "bg-card border border-border/50",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5",
        "active:scale-[0.98] cursor-pointer",
        "tap-highlight-none touch-manipulation"
      )}
    >
      {/* Compact Hero Image Section */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {hasImage ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 shimmer" />
            )}
            <img 
              src={imageUrl} 
              alt={title}
              className={cn(
                "w-full h-full object-cover transition-all duration-500",
                "group-hover:scale-105",
                imageLoading ? "opacity-0" : "opacity-100"
              )}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </>
        ) : (
          <div className={cn(
            "w-full h-full flex items-center justify-center",
            "bg-gradient-to-br from-muted via-muted to-muted/80"
          )}>
            <div className="text-4xl opacity-50">{getRecipeEmoji(healthTags)}</div>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t",
          accent.gradient,
          "via-transparent to-transparent opacity-60"
        )} />
        
        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
          {/* AI Badge */}
          {isAiGenerated && (
            <Badge className={cn(
              "bg-secondary/90 backdrop-blur-md text-secondary-foreground",
              "border-0 gap-1 px-2 py-0.5 text-[10px] font-semibold",
              "shadow-lg shadow-secondary/20"
            )}>
              <Sparkles className="h-2.5 w-2.5" />
              AI
            </Badge>
          )}
          {!isAiGenerated && <div />}
          
          {/* Favorite button */}
          <button
            onClick={onFavoriteToggle}
            className={cn(
              "w-7 h-7 sm:w-8 sm:h-8 rounded-full",
              "bg-background/80 backdrop-blur-md",
              "flex items-center justify-center",
              "transition-all duration-200 active:scale-90",
              "border border-white/20 shadow-lg",
              "hover:bg-background"
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              className={cn(
                "h-3.5 w-3.5 transition-all duration-300",
                isFavorite 
                  ? "fill-destructive text-destructive scale-110" 
                  : "text-muted-foreground"
              )} 
            />
          </button>
        </div>
        
        {/* Time badge at bottom */}
        <div className="absolute bottom-2 left-2">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1",
            "bg-background/90 backdrop-blur-md rounded-full",
            "text-[10px] sm:text-xs font-medium",
            "border border-white/10 shadow-lg"
          )}>
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{prepTime}m</span>
          </div>
        </div>
      </div>
      
      {/* Compact Content Section */}
      <div className="p-3 sm:p-3.5 space-y-2">
        {/* Title */}
        <h3 className="font-bold text-sm sm:text-base leading-tight line-clamp-1 text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        {/* Meta Row - Compact */}
        <div className="flex items-center justify-between">
          {/* Left: Servings & Difficulty */}
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{servings}</span>
            </span>
            <span className="flex items-center gap-1">
              <ChefHat className="h-3 w-3" />
              <span>{getDifficultyLabel(difficulty)}</span>
            </span>
          </div>
          
          {/* Right: Difficulty dots */}
          <div className="flex items-center gap-0.5">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  i < difficulty ? accent.bg : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
        
        {/* Tags - Compact */}
        <div className="flex gap-1 flex-wrap">
          {healthTags.slice(0, 2).map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className={cn(
                "text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5",
                "bg-muted/80 hover:bg-muted border-0 rounded-full",
                "transition-colors"
              )}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Accent line at bottom */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1",
        accent.bg,
        "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      )} />
    </div>
  );
}
