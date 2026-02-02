import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Mic, 
  Sparkles, 
  Clock, 
  Users,
  Star,
  Filter 
} from "lucide-react";
import { useState } from "react";

// Mock recipes
const mockRecipes = [
  {
    id: "1",
    name: "Heart-Healthy Salmon Bowl",
    image: "🐟",
    prepTime: 25,
    servings: 2,
    difficulty: 2,
    tags: ["heart-healthy", "high-fiber"],
  },
  {
    id: "2",
    name: "Mediterranean Quinoa Salad",
    image: "🥗",
    prepTime: 15,
    servings: 4,
    difficulty: 1,
    tags: ["diabetes-friendly", "vegetarian"],
  },
  {
    id: "3",
    name: "Chicken & Vegetable Stir-Fry",
    image: "🍳",
    prepTime: 20,
    servings: 2,
    difficulty: 2,
    tags: ["low-sodium", "high-protein"],
  },
  {
    id: "4",
    name: "Bone-Boosting Smoothie",
    image: "🥤",
    prepTime: 5,
    servings: 1,
    difficulty: 1,
    tags: ["bone-health", "quick"],
  },
  {
    id: "5",
    name: "Anti-Inflammatory Turmeric Soup",
    image: "🍲",
    prepTime: 30,
    servings: 4,
    difficulty: 1,
    tags: ["anti-inflammatory", "comfort-food"],
  },
];

const filters = [
  "All", "Under 15 min", "Heart-Healthy", "Diabetes-Friendly", "High Fiber"
];

export default function Recipes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Recipes" 
        subtitle="Find your next meal"
        showSettings
      />

      <div className="container px-4 py-6 space-y-6">
        {/* AI Recipe Generator */}
        <Button 
          size="lg" 
          className="w-full h-14 text-lg font-semibold gap-3 bg-secondary hover:bg-secondary/90"
        >
          <Sparkles className="h-5 w-5" />
          Create Recipe with AI
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 h-14 text-lg"
          />
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute right-2 top-1/2 -translate-y-1/2"
            aria-label="Voice search"
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button variant="outline" size="sm" className="shrink-0">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          {filters.map((filter) => (
            <Badge
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap px-4 py-2"
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>

        {/* Recipe Grid */}
        <div className="grid gap-4">
          {mockRecipes.map((recipe) => (
            <Card 
              key={recipe.id}
              className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Recipe Image/Emoji */}
                  <div className="w-28 h-28 bg-muted flex items-center justify-center text-5xl shrink-0">
                    {recipe.image}
                  </div>
                  
                  {/* Recipe Info */}
                  <div className="flex-1 p-4 min-w-0">
                    <h3 className="font-semibold text-lg mb-2 truncate">
                      {recipe.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {recipe.prepTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {recipe.servings}
                      </span>
                      <span className="flex items-center gap-1">
                        {[...Array(3)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < recipe.difficulty ? "fill-warning text-warning" : "text-muted"}`}
                          />
                        ))}
                      </span>
                    </div>
                    
                    <div className="flex gap-1 flex-wrap">
                      {recipe.tags.slice(0, 2).map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
