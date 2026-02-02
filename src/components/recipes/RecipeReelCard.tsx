import { useState } from "react";
import { Heart, Clock, Users, Sparkles, ChefHat, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecipeReelCardProps {
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
  if (tags.includes("heart-healthy")) return { bg: "bg-rose-500", text: "text-rose-500", gradient: "from-rose-500/40" };
  if (tags.includes("diabetes-friendly")) return { bg: "bg-blue-500", text: "text-blue-500", gradient: "from-blue-500/40" };
  if (tags.includes("vegetarian")) return { bg: "bg-emerald-500", text: "text-emerald-500", gradient: "from-emerald-500/40" };
  if (tags.includes("high-fiber")) return { bg: "bg-amber-500", text: "text-amber-500", gradient: "from-amber-500/40" };
  if (tags.includes("anti-inflammatory")) return { bg: "bg-purple-500", text: "text-purple-500", gradient: "from-purple-500/40" };
  return { bg: "bg-primary", text: "text-primary", gradient: "from-primary/40" };
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

export function RecipeReelCard({
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
}: RecipeReelCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const accent = getRecipeAccent(healthTags);
  const hasImage = imageUrl && !imageError;
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Full screen background */}
      <div className="absolute inset-0">
        {hasImage ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 shimmer bg-muted" />
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
          <div className={cn(
            "w-full h-full flex items-center justify-center",
            "bg-gradient-to-br from-muted via-muted to-background"
          )}>
            <div className="text-[120px] opacity-30">{getRecipeEmoji(healthTags)}</div>
          </div>
        )}
        
        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
      </div>
      
      {/* Top badges */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
        {isAiGenerated && (
          <Badge className={cn(
            "bg-white/20 backdrop-blur-md text-white",
            "border-0 gap-1.5 px-3 py-1.5 text-sm font-semibold",
            "shadow-lg"
          )}>
            <Sparkles className="h-4 w-4" />
            AI Generated
          </Badge>
        )}
        {!isAiGenerated && <div />}
      </div>
      
      {/* Right side actions - TikTok style */}
      <div className="absolute right-4 bottom-48 flex flex-col items-center gap-6 z-10">
        {/* Favorite button */}
        <button
          onClick={onFavoriteToggle}
          className={cn(
            "w-14 h-14 rounded-full",
            "bg-white/10 backdrop-blur-md",
            "flex items-center justify-center",
            "transition-all duration-200 active:scale-90",
            "border border-white/20"
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            className={cn(
              "h-7 w-7 transition-all duration-300",
              isFavorite 
                ? "fill-red-500 text-red-500" 
                : "text-white"
            )} 
          />
        </button>
        
        {/* Start cooking button */}
        {onStartCooking && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartCooking();
            }}
            className={cn(
              "w-14 h-14 rounded-full",
              "bg-primary/90 backdrop-blur-md",
              "flex items-center justify-center",
              "transition-all duration-200 active:scale-90",
              "border border-white/20 shadow-lg shadow-primary/30"
            )}
            aria-label="Start cooking"
          >
            <Play className="h-7 w-7 text-white ml-1" />
          </button>
        )}
      </div>
      
      {/* Bottom content */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-5 pb-8 z-10"
        onClick={onClick}
      >
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2 drop-shadow-lg">
          {title}
        </h2>
        
        {/* Description */}
        {description && (
          <p className="text-base text-white/80 line-clamp-2 mb-4 leading-relaxed">
            {description}
          </p>
        )}
        
        {/* Meta info */}
        <div className="flex items-center gap-4 text-white/90 text-sm mb-4">
          <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Clock className="h-4 w-4" />
            {prepTime} min
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Users className="h-4 w-4" />
            {servings}
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <ChefHat className="h-4 w-4" />
            {getDifficultyLabel(difficulty)}
          </span>
        </div>
        
        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {healthTags.slice(0, 4).map((tag) => (
            <Badge 
              key={tag} 
              className={cn(
                "text-xs font-medium px-3 py-1.5",
                "bg-white/15 backdrop-blur-sm text-white border-0 rounded-full",
              )}
            >
              {tag}
            </Badge>
          ))}
        </div>
        
        {/* Tap to view hint */}
        <div className="mt-4 flex items-center gap-2 text-white/50 text-sm">
          <span>Tap to view full recipe</span>
        </div>
      </div>
      
      {/* Accent line indicator */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1",
        accent.bg
      )} />
    </div>
  );
}
