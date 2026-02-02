import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { ALLERGY_LABELS, type Allergy } from "@/types/health-profile";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

const allergyIcons: Record<Allergy, string> = {
  "nuts": "🥜",
  "peanuts": "🥜",
  "dairy": "🥛",
  "eggs": "🥚",
  "gluten": "🌾",
  "soy": "🫘",
  "shellfish": "🦐",
  "fish": "🐟",
  "sesame": "🌰",
  "sulfites": "🍷",
};

export function AllergiesStep() {
  const { profile, nextStep, prevStep, toggleAllergy } = useOnboardingStore();

  return (
    <div className="px-6 py-8 animate-fade-in">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <h1 className="text-heading-md font-bold text-foreground">
            Food Allergies
          </h1>
        </div>
        <p className="text-muted-foreground mb-8">
          We'll make sure to exclude these from all recipe suggestions.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {(Object.entries(ALLERGY_LABELS) as [Allergy, string][]).map(
            ([value, label]) => {
              const isChecked = profile.allergies?.includes(value);
              return (
                <Card
                  key={value}
                  className={cn(
                    "flex items-center gap-3 p-4 cursor-pointer transition-all border-2",
                    isChecked
                      ? "border-destructive bg-destructive/5"
                      : "border-border hover:border-destructive/30"
                  )}
                  onClick={() => toggleAllergy(value)}
                >
                  <Checkbox
                    id={`allergy-${value}`}
                    checked={isChecked}
                    className="h-6 w-6"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xl">{allergyIcons[value]}</span>
                    <Label
                      htmlFor={`allergy-${value}`}
                      className="cursor-pointer text-base"
                    >
                      {label}
                    </Label>
                  </div>
                </Card>
              );
            }
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-6 p-4 bg-muted rounded-lg">
          💡 Don't see your allergy? You can add more in your profile settings later.
        </p>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={prevStep}
            className="flex-1 h-14"
          >
            Back
          </Button>
          <Button
            size="lg"
            onClick={nextStep}
            className="flex-1 h-14 text-lg font-semibold"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
