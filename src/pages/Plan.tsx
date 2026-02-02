import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Mock data
const weekDays = [
  { day: "Sun", date: 2, isToday: true },
  { day: "Mon", date: 3, isToday: false },
  { day: "Tue", date: 4, isToday: false },
  { day: "Wed", date: 5, isToday: false },
  { day: "Thu", date: 6, isToday: false },
  { day: "Fri", date: 7, isToday: false },
  { day: "Sat", date: 8, isToday: false },
];

const mealSlots = ["Breakfast", "Lunch", "Dinner", "Snack"];

const mockMeals: Record<string, Record<string, { name: string; status: "planned" | "prepared" | "skipped" } | null>> = {
  "2": {
    Breakfast: { name: "Oatmeal with Berries", status: "prepared" },
    Lunch: { name: "Mediterranean Salad", status: "planned" },
    Dinner: { name: "Grilled Salmon", status: "planned" },
    Snack: { name: "Apple & Almonds", status: "planned" },
  },
  "3": {
    Breakfast: { name: "Greek Yogurt Parfait", status: "planned" },
    Lunch: { name: "Chicken Soup", status: "planned" },
    Dinner: null,
    Snack: { name: "Veggie Sticks", status: "planned" },
  },
  "4": {
    Breakfast: null,
    Lunch: null,
    Dinner: null,
    Snack: null,
  },
};

export default function Plan() {
  const [selectedDate, setSelectedDate] = useState(2);
  const meals = mockMeals[selectedDate.toString()] || {};

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Meal Plan" 
        subtitle="February 2025"
        showSettings
      />

      <div className="container px-4 py-6 space-y-6">
        {/* AI Generate Button */}
        <Button 
          size="lg" 
          className="w-full h-14 text-lg font-semibold gap-3"
        >
          <Sparkles className="h-5 w-5" />
          Auto-Generate Week
        </Button>

        {/* Quick Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge variant="secondary" className="cursor-pointer whitespace-nowrap px-4 py-2">
            <Clock className="h-4 w-4 mr-1" />
            Low Energy Day
          </Badge>
          <Badge variant="outline" className="cursor-pointer whitespace-nowrap px-4 py-2">
            Heart-Healthy
          </Badge>
          <Badge variant="outline" className="cursor-pointer whitespace-nowrap px-4 py-2">
            High Fiber
          </Badge>
        </div>

        {/* Week Calendar */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weekDays.map(({ day, date, isToday }) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[60px] h-20 rounded-xl transition-all",
                selectedDate === date
                  ? "bg-primary text-primary-foreground"
                  : isToday
                  ? "bg-primary/10 text-primary border-2 border-primary"
                  : "bg-card border border-border hover:border-primary/50"
              )}
            >
              <span className="text-sm font-medium">{day}</span>
              <span className="text-xl font-bold">{date}</span>
            </button>
          ))}
        </div>

        {/* Daily Nutrition Score */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
          <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
            <Check className="h-5 w-5 text-success-foreground" />
          </div>
          <div>
            <p className="font-semibold text-success">Balanced Day</p>
            <p className="text-sm text-muted-foreground">Great nutritional variety planned!</p>
          </div>
        </div>

        {/* Meal Slots */}
        <div className="space-y-3">
          {mealSlots.map((slot) => {
            const meal = meals[slot];
            return (
              <Card 
                key={slot}
                className={cn(
                  "transition-all cursor-pointer hover:border-primary/50",
                  meal?.status === "prepared" && "border-success bg-success/5",
                  meal?.status === "skipped" && "border-muted bg-muted/50 opacity-60"
                )}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                    {slot === "Breakfast" && "🍳"}
                    {slot === "Lunch" && "🥗"}
                    {slot === "Dinner" && "🍽️"}
                    {slot === "Snack" && "🍎"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">{slot}</p>
                    {meal ? (
                      <p className="font-semibold truncate">{meal.name}</p>
                    ) : (
                      <p className="text-muted-foreground italic">Tap to add meal</p>
                    )}
                  </div>
                  {meal && (
                    <div className="flex gap-2">
                      {meal.status !== "prepared" && (
                        <Button size="icon" variant="ghost" className="h-10 w-10">
                          <Check className="h-5 w-5 text-success" />
                        </Button>
                      )}
                      {meal.status !== "skipped" && (
                        <Button size="icon" variant="ghost" className="h-10 w-10">
                          <X className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
