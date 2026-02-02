import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Heart, Calendar, ShoppingCart, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: Heart,
    title: "Health-Focused Meals",
    description: "Recipes tailored to your specific health needs",
  },
  {
    icon: Calendar,
    title: "Easy Meal Planning",
    description: "Simple weekly planning with smart suggestions",
  },
  {
    icon: ShoppingCart,
    title: "Smart Shopping Lists",
    description: "Auto-generated lists organized by store section",
  },
  {
    icon: Sparkles,
    title: "AI Recipe Creation",
    description: "Get personalized recipes made just for you",
  },
];

export function WelcomeStep() {
  const nextStep = useOnboardingStore((state) => state.nextStep);

  return (
    <div className="flex flex-col items-center text-center px-6 py-8 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <span className="text-4xl">🥗</span>
      </div>
      
      <h1 className="text-heading-lg font-bold text-foreground mb-3">
        Welcome to NourishWise
      </h1>
      
      <p className="text-body-lg text-muted-foreground mb-8 max-w-md">
        Your personal companion for healthy, delicious meals designed with you in mind.
      </p>

      <div className="w-full max-w-md space-y-4 mb-8">
        {benefits.map(({ icon: Icon, title, description }) => (
          <div 
            key={title} 
            className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border text-left"
          >
            <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <Button 
        size="lg" 
        onClick={nextStep}
        className="w-full max-w-md h-14 text-lg font-semibold"
      >
        Let's Get Started
      </Button>
      
      <p className="text-sm text-muted-foreground mt-4">
        Setup takes about 2 minutes
      </p>
    </div>
  );
}
