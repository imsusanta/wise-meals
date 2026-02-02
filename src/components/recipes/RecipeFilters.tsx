import { cn } from "@/lib/utils";

interface RecipeFiltersProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function RecipeFilters({ filters, activeFilter, onFilterChange }: RecipeFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scroll-native -mx-4 px-4 scrollbar-none">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={cn(
            "shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium",
            "transition-all duration-200 ease-out",
            "tap-highlight-none active:scale-95 touch-manipulation",
            "min-h-[36px] sm:min-h-[40px]",
            activeFilter === filter
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
