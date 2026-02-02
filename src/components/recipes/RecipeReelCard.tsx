import { useState } from "react";
import { Heart, Clock, Users, Sparkles, ChefHat, Play, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <div className="relative w-full h-full flex flex-col">
      {/* Full screen background */}
      <div className="absolute inset-0">
        {hasImage ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted/60 animate-pulse" />
            )}
            <img 
              src={imageUrl} 
              alt={title}
              className={cn(
                "w-full h-full object-cover",
                imageLoading ? "opacity-0" : "opacity-100 transition-opacity duration-700"
              )}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-[140px] opacity-20 select-none">{getRecipeEmoji(healthTags)}</div>
          </div>
        )}
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/50" />
      </div>
      
      {/* Top section - AI badge */}
      <div className="absolute top-[env(safe-area-inset-top,20px)] left-4 right-16 z-20 pt-4">
        {isAiGenerated && (
          <Badge className="bg-gradient-to-r from-violet-500/90 to-purple-500/90 backdrop-blur-md text-white border-0 gap-1.5 px-3 py-1.5 text-sm font-semibold shadow-xl">
            <Sparkles className="h-4 w-4" />
            AI Recipe
          </Badge>
        )}
      </div>
      
      {/* Right side actions - TikTok style */}
      <div className="absolute right-4 bottom-[280px] flex flex-col items-center gap-5 z-20">
        {/* Favorite button */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={onFavoriteToggle}
            className={cn(
              "w-12 h-12 rounded-full",
              "bg-black/30 backdrop-blur-md",
              "flex items-center justify-center",
              "transition-all duration-200 active:scale-90",
              "border border-white/10"
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              className={cn(
                "h-6 w-6 transition-all duration-300",
                isFavorite 
                  ? "fill-red-500 text-red-500 scale-110" 
                  : "text-white"
              )} 
            />
          </button>
          <span className="text-white/70 text-xs font-medium">
            {isFavorite ? "Saved" : "Save"}
          </span>
        </div>
        
        {/* Start cooking button */}
        {onStartCooking && (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartCooking();
              }}
              className={cn(
                "w-12 h-12 rounded-full",
                `bg-gradient-to-br ${accent.gradient}`,
                "flex items-center justify-center",
                "transition-all duration-200 active:scale-90",
                "shadow-lg shadow-black/30"
              )}
              aria-label="Start cooking"
            >
              <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
            </button>
            <span className="text-white/70 text-xs font-medium">Cook</span>
          </div>
        )}
      </div>
      
      {/* Bottom content - card style */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div 
          className="mx-3 mb-8 p-5 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10"
          onClick={onClick}
        >
          {/* Title */}
          <h2 className="text-2xl font-bold text-white leading-tight mb-2">
            {title}
          </h2>
          
          {/* Description */}
          {description && (
            <p className="text-sm text-white/70 line-clamp-2 mb-4 leading-relaxed">
              {description}
            </p>
          )}
          
          {/* Meta info pills */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-white/90 text-sm">
              <Clock className="h-3.5 w-3.5" />
              {prepTime} min
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-white/90 text-sm">
              <Users className="h-3.5 w-3.5" />
              {servings} servings
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-white/90 text-sm">
              <ChefHat className="h-3.5 w-3.5" />
              {getDifficultyLabel(difficulty)}
            </span>
          </div>
          
          {/* Health tags */}
          <div className="flex gap-2 flex-wrap">
            {healthTags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                className={cn(
                  "text-xs font-medium px-3 py-1",
                  `bg-gradient-to-r ${accent.gradient} text-white border-0 rounded-full`,
                )}
              >
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Tap hint */}
          <div className="mt-4 flex items-center justify-center gap-1 text-white/40 text-xs">
            <ChevronUp className="h-3 w-3 animate-bounce" />
            <span>Tap for full recipe</span>
          </div>
        </div>
      </div>
      
      {/* Swipe hint animation */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-1 text-white/30">
          <div className="w-1 h-8 rounded-full bg-white/20 overflow-hidden">
            <div className="w-full h-1/2 bg-white/40 animate-[swipeHint_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
      
      {/* Inline keyframes */}
      <style>{`
        @keyframes swipeHint {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
