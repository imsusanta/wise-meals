import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { 
  WEEKLY_BUDGET_LABELS,
  DIETARY_RESTRICTION_LABELS,
  ALLERGY_LABELS,
  COOKING_SKILL_LABELS,
  HOUSEHOLD_SIZE_LABELS,
  type WeeklyBudget 
} from "@/types/health-profile";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Wallet, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const budgetIcons: Record<WeeklyBudget, string> = {
  "budget-friendly": "💰",
  "moderate": "💵",
  "flexible": "💎",
};

export function BudgetSummaryStep() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, prevStep, setWeeklyBudget, reset } = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProceed = profile.weekly_budget !== undefined;

  const handleComplete = async () => {
    if (!canProceed || !user) return;

    setIsSubmitting(true);
    
    try {
      // Save profile to database
      const { error } = await supabase
        .from("profiles")
        .update({
          age_range: profile.age_range,
          dietary_restrictions: profile.dietary_restrictions || [],
          allergies: profile.allergies || [],
          cooking_skill: profile.cooking_skill,
          household_size: profile.household_size,
          weekly_budget: profile.weekly_budget,
          cooking_for_one_mode: profile.household_size === "1",
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      
      toast({
        title: "Welcome to NourishWise! 🎉",
        description: "Your health profile has been saved. Let's start planning!",
      });
      
      // Clear onboarding state and navigate to home
      reset();
      navigate("/");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-6 py-8 animate-fade-in">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Budget & Review
        </h1>
        <p className="text-muted-foreground mb-8">
          One last step before we get cooking!
        </p>

        {/* Weekly Budget */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-primary" />
            <Label className="text-lg font-semibold">
              Weekly grocery budget preference
            </Label>
          </div>
          <RadioGroup
            value={profile.weekly_budget}
            onValueChange={(value) => setWeeklyBudget(value as WeeklyBudget)}
            className="space-y-3"
          >
            {(Object.entries(WEEKLY_BUDGET_LABELS) as [WeeklyBudget, { label: string; description: string }][]).map(
              ([value, { label, description }]) => (
                <div key={value}>
                  <RadioGroupItem
                    value={value}
                    id={`budget-${value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`budget-${value}`}
                    className="block cursor-pointer"
                  >
                    <Card
                      className={cn(
                        "p-4 border-2 transition-all",
                        profile.weekly_budget === value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{budgetIcons[value]}</span>
                        <div>
                          <p className="font-semibold">{label}</p>
                          <p className="text-sm text-muted-foreground">
                            {description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Label>
                </div>
              )
            )}
          </RadioGroup>
        </div>

        {/* Profile Summary */}
        <Card className="p-5 mb-8 bg-muted/50">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            Your Profile Summary
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age Range</span>
              <span className="font-medium">{profile.age_range || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cooking Skill</span>
              <span className="font-medium">
                {profile.cooking_skill 
                  ? COOKING_SKILL_LABELS[profile.cooking_skill].label 
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Household Size</span>
              <span className="font-medium">
                {profile.household_size 
                  ? HOUSEHOLD_SIZE_LABELS[profile.household_size] 
                  : "—"}
              </span>
            </div>
            {profile.dietary_restrictions && profile.dietary_restrictions.length > 0 && (
              <div>
                <span className="text-muted-foreground block mb-1">Dietary Needs</span>
                <div className="flex flex-wrap gap-1">
                  {profile.dietary_restrictions.map((r) => (
                    <span 
                      key={r} 
                      className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium"
                    >
                      {DIETARY_RESTRICTION_LABELS[r]}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.allergies && profile.allergies.length > 0 && (
              <div>
                <span className="text-muted-foreground block mb-1">Allergies</span>
                <div className="flex flex-wrap gap-1">
                  {profile.allergies.map((a) => (
                    <span 
                      key={a} 
                      className="inline-block px-2 py-0.5 bg-destructive/10 text-destructive rounded text-xs font-medium"
                    >
                      {ALLERGY_LABELS[a]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={prevStep}
            disabled={isSubmitting}
            className="flex-1 h-14"
          >
            Back
          </Button>
          <Button
            size="lg"
            onClick={handleComplete}
            disabled={!canProceed || isSubmitting}
            className="flex-1 h-14 text-lg font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
