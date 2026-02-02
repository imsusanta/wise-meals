import { useState } from "react";
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
  imageUrl?: string | null;
  onClick: () => void;
  onFavoriteToggle: (e: React.MouseEvent) => void;
  index?: number;
  totalCards?: number;
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
  imageUrl,
  onClick,
  onFavoriteToggle,
  index = 0,
  totalCards = 1,
}: RecipeCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // Stack effect: cards peek from behind
  const isStacked = index < 3 && totalCards > 1;
  const stackOffset = isStacked ? index * 4 : 0;
  const stackScale = isStacked ? 1 - index * 0.02 : 1;
  
  return (
    <div
      onClick={onClick}
      style={{
        transform: `translateY(${stackOffset}px) scale(${stackScale})`,
        zIndex: totalCards - index,
      }}
      className={cn(
        "group relative overflow-hidden rounded-[20px] sm:rounded-3xl",
        "bg-gradient-to-br",
        getRecipeGradient(healthTags),
        "border border-border/40 hover:border-primary/30",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1",
        "active:scale-[0.98] cursor-pointer",
        "tap-highlight-none touch-manipulation"
      )}
    >
      {/* Background Image */}
      {imageUrl && !imageError && (
        <div className="absolute inset-0">
          {imageLoading && (
            <div className="absolute inset-0 shimmer" />
          )}
          <img 
            src={imageUrl} 
            alt={title}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoading ? "opacity-0" : "opacity-30 group-hover:opacity-40"
            )}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-card/60" />
        </div>
      )}
      
      {/* Glass overlay */}
      <div className={cn(
        "absolute inset-0 backdrop-blur-sm",
        imageUrl ? "bg-card/50" : "bg-card/70"
      )} />
      
      {/* Content */}
      <div className="relative p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          {/* Image/Emoji Icon */}
          <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-background/80 backdrop-blur flex items-center justify-center overflow-hidden shadow-sm border border-border/20">
            {imageUrl && !imageError ? (
              <div className="relative w-full h-full">
                {imageLoading && (
                  <div className="absolute inset-0 shimmer" />
                )}
                <img 
                  src={imageUrl} 
                  alt={title}
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    imageLoading ? "opacity-0" : "opacity-100"
                  )}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                />
              </div>
            ) : (
              <span className="text-2xl sm:text-3xl">{getRecipeEmoji(healthTags)}</span>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-2 text-foreground">
                {title}
              </h3>
              <button
                onClick={onFavoriteToggle}
                className={cn(
                  "shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full transition-all duration-200",
                  "bg-background/50 hover:bg-background/80 active:scale-90",
                  "touch-manipulation"
                )}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart 
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isFavorite 
                      ? "fill-destructive text-destructive scale-110" 
                      : "text-muted-foreground"
                  )} 
                />
              </button>
            </div>
            
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mb-2">
                {description}
              </p>
            )}
            
            {/* Meta Info - Responsive */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="font-medium">{prepTime}m</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
            
            {/* Tags - Responsive */}
            <div className="flex gap-1 sm:gap-1.5 flex-wrap">
              {healthTags.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 bg-background/70 backdrop-blur-sm border-0 rounded-full"
                >
                  {tag}
                </Badge>
              ))}
              {isAiGenerated && (
                <Badge 
                  variant="outline" 
                  className="text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 bg-secondary/10 border-secondary/20 text-secondary rounded-full"
                >
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
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
