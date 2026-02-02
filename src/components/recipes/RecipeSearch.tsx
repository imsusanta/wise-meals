import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipeSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RecipeSearch({ value, onChange, placeholder = "Search recipes..." }: RecipeSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl",
          "bg-muted/50 border border-border/50",
          "text-base sm:text-lg placeholder:text-muted-foreground/60",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
          "transition-all duration-200",
          "touch-manipulation"
        )}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted transition-colors touch-manipulation"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
