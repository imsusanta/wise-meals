import { cn } from "@/lib/utils";

// Base shimmer skeleton
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "rounded-md shimmer",
        className
      )} 
      {...props} 
    />
  );
}

// Recipe card skeleton for grid view - Compact
export function RecipeCardSkeleton() {
  return (
    <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-card border border-border">
      {/* Image placeholder */}
      <div className="aspect-[16/9] shimmer" />
      
      {/* Content */}
      <div className="p-3 sm:p-3.5 space-y-2">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Meta info */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-10 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
          <div className="flex gap-0.5">
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Recipe reel skeleton for full-screen view
export function RecipeReelSkeleton() {
  return (
    <div className="relative w-full h-full">
      {/* Full screen background shimmer */}
      <div className="absolute inset-0 shimmer" />
      
      {/* Top badge placeholder */}
      <div className="absolute top-[env(safe-area-inset-top,20px)] left-4 pt-4 z-20">
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      
      {/* Right side actions placeholder */}
      <div className="absolute right-4 bottom-[280px] flex flex-col items-center gap-5 z-20">
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-3 w-8 mt-1" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-3 w-8 mt-1" />
        </div>
      </div>
      
      {/* Bottom content card placeholder */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="mx-3 mb-8 p-5 rounded-3xl bg-muted/30 backdrop-blur-xl border border-border/30">
          {/* Title */}
          <Skeleton className="h-8 w-4/5 mb-3" />
          
          {/* Description */}
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          {/* Meta pills */}
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
          
          {/* Tags */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Meal plan slot skeleton
export function MealSlotSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-4">
      <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex gap-1">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
    </div>
  );
}

// Calendar day skeleton
export function CalendarDaySkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-w-[56px] h-20 rounded-2xl bg-card border border-border">
      <Skeleton className="h-3 w-6 mb-1" />
      <Skeleton className="h-6 w-4 mb-1" />
      <div className="flex gap-0.5 mt-1">
        <Skeleton className="w-1.5 h-1.5 rounded-full" />
        <Skeleton className="w-1.5 h-1.5 rounded-full" />
      </div>
    </div>
  );
}

// Grocery item skeleton
export function GroceryItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
      <Skeleton className="w-6 h-6 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-12 rounded-full" />
    </div>
  );
}

// Full page loading skeleton
export function PageLoadingSkeleton({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated cooking pot */}
        <div className="relative">
          <div className="text-6xl animate-bounce">🍳</div>
          
          {/* Floating particles */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-2">
            <span className="text-lg animate-[float_1.5s_ease-in-out_infinite]">✨</span>
            <span className="text-lg animate-[float_1.5s_ease-in-out_infinite_0.3s]">✨</span>
            <span className="text-lg animate-[float_1.5s_ease-in-out_infinite_0.6s]">✨</span>
          </div>
        </div>
        
        {/* Loading text with shimmer */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-2 w-32 rounded-full overflow-hidden bg-muted">
            <div className="h-full w-1/2 bg-primary/50 rounded-full animate-[loading_1s_ease-in-out_infinite]" />
          </div>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-8px) scale(1.1); opacity: 1; }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

// Inline loading skeleton with staggered animation
export function InlineLoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className="rounded-xl bg-card border border-border p-4 animate-fade-in"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export { Skeleton };
