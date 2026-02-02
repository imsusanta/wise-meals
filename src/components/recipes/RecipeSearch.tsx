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
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full pl-12 pr-12 py-4 rounded-2xl",
          "bg-muted/50 border border-border/50",
          "text-lg placeholder:text-muted-foreground/60",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
          "transition-all duration-200"
        )}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
