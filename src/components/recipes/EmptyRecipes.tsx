import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyRecipesProps {
  onCreateClick: () => void;
}

export function EmptyRecipes({ onCreateClick }: EmptyRecipesProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {/* Animated Cooking Illustration */}
      <div className="relative w-48 h-48 mb-8">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 rounded-full blur-3xl animate-pulse" />
        
        {/* Main pot */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-20">
          {/* Pot body */}
          <div className="absolute bottom-0 w-full h-16 bg-gradient-to-b from-muted-foreground/30 to-muted-foreground/50 rounded-b-[50%] rounded-t-lg" />
          {/* Pot rim */}
          <div className="absolute top-0 w-full h-3 bg-muted-foreground/40 rounded-t-lg" />
          {/* Pot handles */}
          <div className="absolute top-1 -left-3 w-4 h-3 bg-muted-foreground/30 rounded-l-full" />
          <div className="absolute top-1 -right-3 w-4 h-3 bg-muted-foreground/30 rounded-r-full" />
        </div>
        
        {/* Steam animations */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-3">
          <div 
            className={cn(
              "w-3 h-8 rounded-full bg-gradient-to-t from-muted-foreground/20 to-transparent",
              "animate-steam-1"
            )} 
          />
          <div 
            className={cn(
              "w-4 h-10 rounded-full bg-gradient-to-t from-muted-foreground/25 to-transparent",
              "animate-steam-2"
            )} 
          />
          <div 
            className={cn(
              "w-3 h-7 rounded-full bg-gradient-to-t from-muted-foreground/20 to-transparent",
              "animate-steam-3"
            )} 
          />
        </div>
        
        {/* Floating ingredients */}
        <div className="absolute top-4 left-6 text-3xl animate-float-1">🥕</div>
        <div className="absolute top-8 right-4 text-2xl animate-float-2">🍅</div>
        <div className="absolute top-2 right-12 text-2xl animate-float-3">🧅</div>
        <div className="absolute bottom-24 left-4 text-xl animate-float-4">🌿</div>
        
        {/* Sparkle effects */}
        <div className="absolute top-6 left-1/2 text-lg animate-sparkle-1">✨</div>
        <div className="absolute top-12 right-8 text-sm animate-sparkle-2">✨</div>
        <div className="absolute bottom-28 right-6 text-base animate-sparkle-3">✨</div>
      </div>
      
      <h3 className="text-xl font-bold mb-2">No recipes yet</h3>
      <p className="text-muted-foreground mb-6 max-w-[280px] leading-relaxed">
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
      
      {/* Inline keyframes styles */}
      <style>{`
        @keyframes steam-1 {
          0%, 100% { transform: translateY(0) scaleY(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scaleY(1.2); opacity: 0; }
        }
        @keyframes steam-2 {
          0%, 100% { transform: translateY(0) scaleY(1); opacity: 0.7; }
          50% { transform: translateY(-25px) scaleY(1.3); opacity: 0; }
        }
        @keyframes steam-3 {
          0%, 100% { transform: translateY(0) scaleY(1); opacity: 0.5; }
          50% { transform: translateY(-18px) scaleY(1.1); opacity: 0; }
        }
        @keyframes float-1 {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(8deg); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes sparkle-1 {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes sparkle-2 {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          40% { opacity: 1; transform: scale(1.2); }
          60% { opacity: 1; transform: scale(1); }
        }
        @keyframes sparkle-3 {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          30% { opacity: 0; }
          60% { opacity: 1; transform: scale(1.1); }
        }
        .animate-steam-1 { animation: steam-1 2s ease-in-out infinite; }
        .animate-steam-2 { animation: steam-2 2.5s ease-in-out infinite 0.3s; }
        .animate-steam-3 { animation: steam-3 2.2s ease-in-out infinite 0.6s; }
        .animate-float-1 { animation: float-1 3s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 3.5s ease-in-out infinite 0.5s; }
        .animate-float-3 { animation: float-3 2.8s ease-in-out infinite 0.8s; }
        .animate-float-4 { animation: float-4 3.2s ease-in-out infinite 0.2s; }
        .animate-sparkle-1 { animation: sparkle-1 2s ease-in-out infinite; }
        .animate-sparkle-2 { animation: sparkle-2 2.5s ease-in-out infinite 0.4s; }
        .animate-sparkle-3 { animation: sparkle-3 3s ease-in-out infinite 0.8s; }
      `}</style>
    </div>
  );
}
