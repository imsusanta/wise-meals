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
  ShoppingCart 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  section: string;
  checked: boolean;
  price?: number;
}

const mockItems: GroceryItem[] = [
  { id: "1", name: "Salmon fillets", quantity: "1 lb", section: "Proteins", checked: false, price: 12.99 },
  { id: "2", name: "Chicken breast", quantity: "2 lbs", section: "Proteins", checked: true, price: 8.99 },
  { id: "3", name: "Spinach", quantity: "1 bag", section: "Produce", checked: false, price: 3.49 },
  { id: "4", name: "Blueberries", quantity: "1 pint", section: "Produce", checked: false, price: 4.99 },
  { id: "5", name: "Greek yogurt", quantity: "32 oz", section: "Dairy", checked: false, price: 5.99 },
  { id: "6", name: "Eggs", quantity: "1 dozen", section: "Dairy", checked: true, price: 4.49 },
  { id: "7", name: "Quinoa", quantity: "1 bag", section: "Pantry", checked: false, price: 6.99 },
  { id: "8", name: "Olive oil", quantity: "1 bottle", section: "Pantry", checked: false, price: 9.99 },
];

const sectionEmojis: Record<string, string> = {
  Produce: "🥬",
  Proteins: "🥩",
  Dairy: "🥛",
  Pantry: "🫙",
  Frozen: "🧊",
};

export default function GroceryList() {
  const [items, setItems] = useState(mockItems);
  const [newItemName, setNewItemName] = useState("");

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name: newItemName,
      quantity: "1",
      section: "Pantry",
      checked: false,
    };
    setItems([...items, newItem]);
    setNewItemName("");
  };

  // Group items by section
  const sections = items.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const checkedCount = items.filter(i => i.checked).length;
  const totalItems = items.length;
  const estimatedTotal = items
    .filter(i => !i.checked)
    .reduce((sum, item) => sum + (item.price || 0), 0);

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
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Estimated Cost */}
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
            <Badge variant="secondary" className="text-sm">
              {totalItems - checkedCount} items left
            </Badge>
          </CardContent>
        </Card>

        {/* Items by Section */}
        <div className="space-y-4">
          {Object.entries(sections).map(([section, sectionItems]) => {
            const allChecked = sectionItems.every(i => i.checked);
            return (
              <Card key={section} className={cn(allChecked && "opacity-60")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{sectionEmojis[section] || "📦"}</span>
                    {section}
                    <Badge variant="outline" className="ml-auto">
                      {sectionItems.filter(i => !i.checked).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {sectionItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg transition-all cursor-pointer",
                        item.checked 
                          ? "bg-muted/50 line-through text-muted-foreground" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => toggleItem(item.id)}
                    >
                      <Checkbox
                        checked={item.checked}
                        className="h-6 w-6"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium",
                          item.checked && "line-through"
                        )}>
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity}
                        </p>
                      </div>
                      {item.price && (
                        <span className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
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
