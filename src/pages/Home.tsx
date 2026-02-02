import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Droplets, 
  TrendingUp, 
  Lightbulb,
  ChevronRight 
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for demo
const todaysMeals = [
  { type: "Breakfast", name: "Oatmeal with Berries", time: "8:00 AM", emoji: "🥣" },
  { type: "Lunch", name: "Mediterranean Salad", time: "12:30 PM", emoji: "🥗" },
  { type: "Dinner", name: "Grilled Salmon & Veggies", time: "6:00 PM", emoji: "🐟" },
  { type: "Snack", name: "Apple with Almond Butter", time: "3:00 PM", emoji: "🍎" },
];

const healthTip = {
  emoji: "💡",
  title: "Tip of the Day",
  content: "Adding a handful of leafy greens to your meals can boost your fiber intake and support heart health!",
};

export default function Home() {
  const hydrationProgress = 60; // 6 of 10 glasses

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Good Morning! ☀️" 
        subtitle="Sunday, February 2"
        showSettings
      />

      <div className="container px-4 py-6 space-y-6">
        {/* Quick AI Suggestion */}
        <Button 
          size="lg" 
          className="w-full h-16 text-lg font-semibold gap-3 bg-secondary hover:bg-secondary/90"
        >
          <Sparkles className="h-6 w-6" />
          What Should I Eat Now?
        </Button>

        {/* Today's Meals */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Today's Meals</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/plan" className="text-primary">
                  View Week <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaysMeals.map((meal) => (
              <div 
                key={meal.type}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <span className="text-3xl">{meal.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">{meal.type}</p>
                  <p className="font-semibold truncate">{meal.name}</p>
                </div>
                <span className="text-sm text-muted-foreground shrink-0">
                  {meal.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Hydration Tracker */}
        <Card className="bg-info/5 border-info/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-info/20 flex items-center justify-center">
                <Droplets className="h-6 w-6 text-info" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Stay Hydrated</h3>
                <p className="text-sm text-muted-foreground">
                  {Math.round(hydrationProgress / 10)} of 10 glasses today
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-info text-info hover:bg-info hover:text-info-foreground"
              >
                + Add Glass
              </Button>
            </div>
            <Progress 
              value={hydrationProgress} 
              className="h-3 bg-info/20"
            />
          </CardContent>
        </Card>

        {/* Weekly Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">This Week's Nutrition</h3>
                <p className="text-sm text-muted-foreground">
                  You're doing great! 🎉
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-success/10">
                <p className="text-sm text-muted-foreground">Fiber</p>
                <p className="text-lg font-bold text-success">Good</p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <p className="text-sm text-muted-foreground">Sodium</p>
                <p className="text-lg font-bold text-success">Low</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/10">
                <p className="text-sm text-muted-foreground">Protein</p>
                <p className="text-lg font-bold text-warning">Fair</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Tip */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-primary mb-1">
                  {healthTip.title}
                </h3>
                <p className="text-sm text-foreground leading-relaxed">
                  {healthTip.content}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
