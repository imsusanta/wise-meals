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
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Shopping List" 
        subtitle={`${checkedCount} of ${totalItems} items`}
        showSettings
        rightAction={
          <Button variant="ghost" size="icon" aria-label="Share list">
            <Share2 className="h-5 w-5" />
          </Button>
        }
      />

      <div className="container px-4 py-6 space-y-6">
        {/* Add Item */}
        <div className="flex gap-2">
          <Input
            placeholder="Add an item..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            className="h-14 text-lg"
          />
          <Button 
            size="icon" 
            className="h-14 w-14 shrink-0"
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
