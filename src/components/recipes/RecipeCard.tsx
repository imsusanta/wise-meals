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
        "group relative overflow-hidden rounded-2xl sm:rounded-3xl",
        "bg-card border border-border/50",
        "transition-all duration-300 ease-out",
        "hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1",
        "active:scale-[0.98] cursor-pointer",
        "tap-highlight-none touch-manipulation"
      )}
    >
      {/* Hero Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
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
            <div className="text-6xl opacity-50">{getRecipeEmoji(healthTags)}</div>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t",
          accent.gradient,
          "via-transparent to-transparent opacity-60"
        )} />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {/* AI Badge */}
          {isAiGenerated && (
            <Badge className={cn(
              "bg-secondary/90 backdrop-blur-md text-secondary-foreground",
              "border-0 gap-1 px-2.5 py-1 text-xs font-semibold",
              "shadow-lg shadow-secondary/20"
            )}>
              <Sparkles className="h-3 w-3" />
              AI
            </Badge>
          )}
          {!isAiGenerated && <div />}
          
          {/* Favorite button */}
          <button
            onClick={onFavoriteToggle}
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-full",
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
                "h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300",
                isFavorite 
                  ? "fill-destructive text-destructive scale-110" 
                  : "text-muted-foreground"
              )} 
            />
          </button>
        </div>
        
        {/* Time badge at bottom */}
        <div className="absolute bottom-3 left-3">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5",
            "bg-background/90 backdrop-blur-md rounded-full",
            "text-xs sm:text-sm font-medium",
            "border border-white/10 shadow-lg"
          )}>
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{prepTime} min</span>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
        
        {/* Meta Row */}
        <div className="flex items-center justify-between pt-1">
          {/* Left: Servings & Difficulty */}
          <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{servings} servings</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ChefHat className="h-3.5 w-3.5" />
              <span>{getDifficultyLabel(difficulty)}</span>
            </span>
          </div>
          
          {/* Right: Difficulty dots */}
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i < difficulty ? accent.bg : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap pt-1">
          {healthTags.slice(0, 3).map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className={cn(
                "text-[10px] sm:text-xs font-medium px-2.5 py-1",
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
