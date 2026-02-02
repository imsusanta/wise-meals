import { useState } from "react";
import { Heart, Clock, Users, Sparkles, ChefHat, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CompactReelCardProps {
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
  onStartCooking?: () => void;
}

const getRecipeAccent = (tags: string[]) => {
  if (tags.includes("heart-healthy")) return { bg: "bg-rose-500", gradient: "from-rose-600 to-rose-400" };
  if (tags.includes("diabetes-friendly")) return { bg: "bg-blue-500", gradient: "from-blue-600 to-blue-400" };
  if (tags.includes("vegetarian")) return { bg: "bg-emerald-500", gradient: "from-emerald-600 to-emerald-400" };
  if (tags.includes("high-fiber")) return { bg: "bg-amber-500", gradient: "from-amber-600 to-amber-400" };
  if (tags.includes("anti-inflammatory")) return { bg: "bg-purple-500", gradient: "from-purple-600 to-purple-400" };
  return { bg: "bg-primary", gradient: "from-primary to-primary/80" };
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

export function CompactReelCard({
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
  onStartCooking,
}: CompactReelCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const accent = getRecipeAccent(healthTags);
  const hasImage = imageUrl && !imageError;
  
  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      {/* Card container - compact size */}
      <div 
        onClick={onClick}
        className={cn(
          "relative w-full max-w-sm overflow-hidden rounded-3xl",
          "bg-card border border-border/30",
          "shadow-2xl shadow-black/20",
          "transition-all duration-300 active:scale-[0.98]",
          "cursor-pointer tap-highlight-none touch-manipulation"
        )}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {hasImage ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 shimmer" />
              )}
              <img 
                src={imageUrl} 
                alt={title}
                className={cn(
                  "w-full h-full object-cover",
                  imageLoading ? "opacity-0" : "opacity-100 transition-opacity duration-500"
                )}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted via-muted/80 to-muted/60 flex items-center justify-center">
              <div className="text-6xl opacity-30 select-none">{getRecipeEmoji(healthTags)}</div>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            {isAiGenerated && (
              <Badge className="bg-secondary/90 backdrop-blur-md text-secondary-foreground border-0 gap-1 px-2.5 py-1 text-xs font-semibold shadow-lg">
                <Sparkles className="h-3 w-3" />
                AI
              </Badge>
            )}
            {!isAiGenerated && <div />}
            
            {/* Favorite button */}
            <button
              onClick={onFavoriteToggle}
              className={cn(
                "w-10 h-10 rounded-full",
                "bg-white/20 backdrop-blur-md",
                "flex items-center justify-center",
                "transition-all duration-200 active:scale-90",
                "border border-white/20 shadow-lg"
              )}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isFavorite 
                    ? "fill-red-500 text-red-500 scale-110" 
                    : "text-white"
                )} 
              />
            </button>
          </div>
          
          {/* Time badge */}
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-semibold text-foreground shadow-lg">
              <Clock className="h-3.5 w-3.5" />
              <span>{prepTime} min</span>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h2 className="text-lg font-bold text-foreground leading-tight line-clamp-2">
            {title}
          </h2>
          
          {/* Meta info */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {servings} servings
            </span>
            <span className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              {getDifficultyLabel(difficulty)}
            </span>
          </div>
          
          {/* Health tags */}
          <div className="flex gap-1.5 flex-wrap">
            {healthTags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="text-[10px] font-medium px-2 py-0.5 bg-muted/80 border-0 rounded-full"
              >
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Start Cooking Button */}
          {onStartCooking && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartCooking();
              }}
              className={cn(
                "w-full mt-2 py-3 rounded-2xl",
                `bg-gradient-to-r ${accent.gradient}`,
                "text-white font-semibold text-sm",
                "flex items-center justify-center gap-2",
                "transition-all duration-200 active:scale-[0.98]",
                "shadow-lg shadow-primary/20"
              )}
            >
              <Play className="h-4 w-4" fill="white" />
              Start Cooking
            </button>
          )}
        </div>
        
        {/* Accent line */}
        <div className={cn("absolute bottom-0 left-0 right-0 h-1", accent.bg)} />
      </div>
    </div>
  );
}
