import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Share2, 
  DollarSign,
  ShoppingCart,
  Loader2,
  Trash2,
  CalendarDays,
  RefreshCw
} from "lucide-react";
import { GroceryItemSkeleton } from "@/components/ui/loading-skeletons";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, addDays } from "date-fns";

interface GroceryItem {
  id: string;
  name: string;
  quantity: string | null;
  category: string;
  is_checked: boolean;
  estimated_price: number | null;
}

const sectionEmojis: Record<string, string> = {
  produce: "🥬",
  proteins: "🥩",
  dairy: "🥛",
  grains: "🌾",
  pantry: "🫙",
  frozen: "🧊",
  beverages: "🥤",
  other: "📦",
};

const categoryLabels: Record<string, string> = {
  produce: "Produce",
  proteins: "Proteins",
  dairy: "Dairy",
  grains: "Grains",
  pantry: "Pantry",
  frozen: "Frozen",
  beverages: "Beverages",
  other: "Other",
};

export default function GroceryList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchActiveList();
  }, [user]);

  const fetchActiveList = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    // Get or create active shopping list
    let { data: lists } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1);

    let listId = lists?.[0]?.id;

    if (!listId) {
      // Create new active list
      const { data: newList } = await supabase
        .from("shopping_lists")
        .insert({ user_id: user.id, name: "My Shopping List" })
        .select("id")
        .single();
      
      listId = newList?.id;
    }

    setActiveListId(listId || null);

    if (listId) {
      const { data: listItems } = await supabase
        .from("shopping_list_items")
        .select("id, name, quantity, category, is_checked, estimated_price")
        .eq("shopping_list_id", listId)
        .order("created_at", { ascending: true });

      setItems(listItems || []);
    }
    
    setIsLoading(false);
  };

  const toggleItem = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setItems(items.map(item => 
      item.id === id ? { ...item, is_checked: !currentStatus } : item
    ));

    const { error } = await supabase
      .from("shopping_list_items")
      .update({ is_checked: !currentStatus })
      .eq("id", id);

    if (error) {
      // Revert on error
      setItems(items.map(item => 
        item.id === id ? { ...item, is_checked: currentStatus } : item
      ));
    }
  };

  const addItem = async () => {
    if (!newItemName.trim() || !activeListId) return;
    
    setIsAdding(true);
    
    const { data, error } = await supabase
      .from("shopping_list_items")
      .insert({
        shopping_list_id: activeListId,
        name: newItemName.trim(),
        quantity: "1",
        category: "other",
      })
      .select()
      .single();

    if (!error && data) {
      setItems([...items, data]);
      setNewItemName("");
    }
    
    setIsAdding(false);
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .eq("id", id);

    if (!error) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const clearCheckedItems = async () => {
    const checkedIds = items.filter(i => i.is_checked).map(i => i.id);
    
    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .in("id", checkedIds);

    if (!error) {
      setItems(items.filter(item => !item.is_checked));
      toast({
        title: "Items cleared",
        description: `Removed ${checkedIds.length} checked items.`,
      });
    }
  };

  type GroceryCategory = "produce" | "proteins" | "dairy" | "grains" | "pantry" | "frozen" | "beverages" | "other";

  // Categorize ingredient based on name
  const categorizeIngredient = (name: string): GroceryCategory => {
    const lowerName = name.toLowerCase();
    
    // Produce
    if (/lettuce|spinach|kale|carrot|tomato|onion|garlic|pepper|cucumber|broccoli|celery|mushroom|potato|zucchini|squash|eggplant|cabbage|beans|peas|corn|avocado|lemon|lime|orange|apple|banana|berry|fruit|vegetable|salad|greens|herb|basil|cilantro|parsley|mint|ginger/.test(lowerName)) {
      return "produce";
    }
    
    // Proteins
    if (/chicken|beef|pork|fish|salmon|tuna|shrimp|egg|tofu|turkey|lamb|bacon|sausage|meat|steak|ground|fillet|breast|thigh|wing/.test(lowerName)) {
      return "proteins";
    }
    
    // Dairy
    if (/milk|cheese|yogurt|cream|butter|sour cream|cottage|mozzarella|cheddar|parmesan|feta/.test(lowerName)) {
      return "dairy";
    }
    
    // Grains
    if (/rice|pasta|bread|flour|oat|cereal|quinoa|barley|wheat|noodle|tortilla|wrap|cracker|grain/.test(lowerName)) {
      return "grains";
    }
    
    // Pantry
    if (/oil|vinegar|sauce|soy|salt|pepper|spice|sugar|honey|maple|stock|broth|can|bean|lentil|chickpea|tomato paste|mustard|mayo|ketchup/.test(lowerName)) {
      return "pantry";
    }
    
    // Frozen
    if (/frozen|ice cream/.test(lowerName)) {
      return "frozen";
    }
    
    // Beverages
    if (/juice|water|soda|coffee|tea|drink|beverage/.test(lowerName)) {
      return "beverages";
    }
    
    return "other";
  };

  // Sync ingredients from meal plan
  const syncFromMealPlan = async () => {
    if (!user || !activeListId) return;
    
    setIsSyncing(true);
    
    try {
      // Get this week's meal plan
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      const weekStartStr = format(weekStart, "yyyy-MM-dd");
      
      const { data: plans } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("week_start", weekStartStr)
        .limit(1);
      
      if (!plans || plans.length === 0) {
        toast({
          title: "No meal plan found",
          description: "Create a meal plan first to sync ingredients.",
          variant: "destructive",
        });
        setIsSyncing(false);
        return;
      }
      
      // Get all meal plan items with recipes
      const { data: mealItems } = await supabase
        .from("meal_plan_items")
        .select(`
          id,
          recipes (
            id,
            title,
            ingredients
          )
        `)
        .eq("meal_plan_id", plans[0].id)
        .not("recipe_id", "is", null);
      
      if (!mealItems || mealItems.length === 0) {
        toast({
          title: "No recipes in plan",
          description: "Add recipes to your meal plan first.",
        });
        setIsSyncing(false);
        return;
      }
      
      // Extract all ingredients from recipes
      const allIngredients: Array<{ name: string; amount: string }> = [];
      
      for (const item of mealItems) {
        const recipe = item.recipes as any;
        if (recipe?.ingredients && Array.isArray(recipe.ingredients)) {
          for (const ing of recipe.ingredients) {
            allIngredients.push({
              name: ing.name || ing,
              amount: ing.amount || "1",
            });
          }
        }
      }
      
      if (allIngredients.length === 0) {
        toast({
          title: "No ingredients found",
          description: "The recipes in your plan don't have ingredients.",
        });
        setIsSyncing(false);
        return;
      }
      
      // Combine duplicate ingredients
      const ingredientMap = new Map<string, string>();
      for (const ing of allIngredients) {
        const key = ing.name.toLowerCase().trim();
        if (ingredientMap.has(key)) {
          // Just keep the first amount for simplicity
          continue;
        }
        ingredientMap.set(key, ing.amount);
      }
      
      // Get existing item names to avoid duplicates
      const existingNames = new Set(items.map(i => i.name.toLowerCase().trim()));
      
      // Prepare new items
      const newItems: Array<{
        shopping_list_id: string;
        name: string;
        quantity: string;
        category: GroceryCategory;
      }> = [];
      
      for (const [name, amount] of ingredientMap) {
        if (!existingNames.has(name)) {
          newItems.push({
            shopping_list_id: activeListId,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            quantity: amount,
            category: categorizeIngredient(name),
          });
        }
      }
      
      if (newItems.length === 0) {
        toast({
          title: "Already synced",
          description: "All ingredients are already in your list.",
        });
        setIsSyncing(false);
        return;
      }
      
      // Insert new items
      const { data: insertedItems, error } = await supabase
        .from("shopping_list_items")
        .insert(newItems)
        .select();
      
      if (error) {
        throw error;
      }
      
      // Update state
      if (insertedItems) {
        setItems([...items, ...insertedItems]);
      }
      
      toast({
        title: "Ingredients synced! 🛒",
        description: `Added ${newItems.length} ingredients from your meal plan.`,
      });
      
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync failed",
        description: "Couldn't sync ingredients. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsSyncing(false);
  };

  // Group items by section
  const sections = items.reduce((acc, item) => {
    const category = item.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const checkedCount = items.filter(i => i.is_checked).length;
  const totalItems = items.length;
  const estimatedTotal = items
    .filter(i => !i.is_checked)
    .reduce((sum, item) => sum + (item.estimated_price || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader 
          title="Shopping List" 
          subtitle="Loading..."
        />
        <div className="container px-4 py-6 space-y-6 animate-fade-in">
          {/* Add item skeleton */}
          <div className="flex gap-2">
            <div className="flex-1 h-14 shimmer rounded-lg" />
            <div className="w-14 h-14 shimmer rounded-lg" />
          </div>
          
          {/* Summary skeleton */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 shimmer rounded-xl" />
              <div className="space-y-2">
                <div className="h-5 w-32 shimmer rounded" />
                <div className="h-4 w-24 shimmer rounded" />
              </div>
            </div>
            <div className="h-10 w-24 shimmer rounded-xl" />
          </div>
          
          {/* Item skeletons */}
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <GroceryItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Shopping List" 
        subtitle={`${checkedCount} of ${totalItems} items`}
        rightAction={
          <Button variant="ghost" size="icon" aria-label="Share list">
            <Share2 className="h-5 w-5" />
          </Button>
        }
      />

      <div className="container px-4 py-6 space-y-6">
        {/* Sync from Meal Plan Button */}
        <Button 
          variant="outline"
          onClick={syncFromMealPlan}
          disabled={isSyncing}
          className={cn(
            "w-full h-14 rounded-2xl gap-2 text-base font-semibold",
            "border-2 border-dashed border-primary/30",
            "bg-gradient-to-r from-primary/5 to-primary/10",
            "hover:border-primary/50 hover:from-primary/10 hover:to-primary/15",
            "transition-all active:scale-[0.98]"
          )}
        >
          {isSyncing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Syncing ingredients...
            </>
          ) : (
            <>
              <CalendarDays className="h-5 w-5" />
              Sync from This Week's Plan
            </>
          )}
        </Button>

        {/* Add Item */}
        <div className="flex gap-2">
          <Input
            placeholder="Add an item..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            className="h-14 text-lg rounded-xl"
          />
          <Button 
            size="icon" 
            className="h-14 w-14 shrink-0 rounded-xl"
            onClick={addItem}
            disabled={isAdding || !newItemName.trim()}
          >
            {isAdding ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
          </Button>
        </div>

        {/* Estimated Cost */}
        {items.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Total</p>
                  <p className="text-xl font-bold">${estimatedTotal.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {totalItems - checkedCount} items left
                </Badge>
                {checkedCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearCheckedItems}
                    className="text-muted-foreground"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear done
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items by Section */}
        <div className="space-y-4">
          {Object.entries(sections).map(([section, sectionItems]) => {
            const allChecked = sectionItems.every(i => i.is_checked);
            return (
              <Card key={section} className={cn(allChecked && "opacity-60")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{sectionEmojis[section] || "📦"}</span>
                    {categoryLabels[section] || section}
                    <Badge variant="outline" className="ml-auto">
                      {sectionItems.filter(i => !i.is_checked).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {sectionItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg transition-all",
                        item.is_checked 
                          ? "bg-muted/50" 
                          : "hover:bg-muted/50"
                      )}
                    >
                      <Checkbox
                        checked={item.is_checked}
                        onCheckedChange={() => toggleItem(item.id, item.is_checked)}
                        className="h-6 w-6"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium",
                          item.is_checked && "line-through text-muted-foreground"
                        )}>
                          {item.name}
                        </p>
                        {item.quantity && (
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}
                          </p>
                        )}
                      </div>
                      {item.estimated_price && (
                        <span className="text-sm text-muted-foreground">
                          ${item.estimated_price.toFixed(2)}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Your list is empty</h3>
            <p className="text-muted-foreground">
              Add items manually or generate a list from your meal plan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
