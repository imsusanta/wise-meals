import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { 
  COOKING_SKILL_LABELS, 
  HOUSEHOLD_SIZE_LABELS,
  type CookingSkill, 
  type HouseholdSize 
} from "@/types/health-profile";
import { cn } from "@/lib/utils";
import { ChefHat, Users } from "lucide-react";

const skillIcons: Record<CookingSkill, string> = {
  beginner: "👨‍🍳",
  comfortable: "👨‍🍳",
  experienced: "👨‍🍳",
};

const householdIcons: Record<HouseholdSize, string> = {
  "1": "👤",
  "2": "👥",
  "3-4": "👨‍👩‍👧",
  "5+": "👨‍👩‍👧‍👦",
};

export function CookingPreferencesStep() {
  const { profile, nextStep, prevStep, setCookingSkill, setHouseholdSize } = useOnboardingStore();

  const canProceed = profile.cooking_skill && profile.household_size;

  return (
    <div className="px-6 py-8 animate-fade-in">
      <div className="max-w-lg mx-auto">
        <h1 className="text-heading-md font-bold text-foreground mb-2">
          Cooking Preferences
        </h1>
        <p className="text-muted-foreground mb-8">
          Help us suggest recipes that match your comfort level.
        </p>

        {/* Cooking Skill */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="h-5 w-5 text-primary" />
            <Label className="text-lg font-semibold">
              Your cooking skill level
            </Label>
          </div>
          <RadioGroup
            value={profile.cooking_skill}
            onValueChange={(value) => setCookingSkill(value as CookingSkill)}
            className="space-y-3"
          >
            {(Object.entries(COOKING_SKILL_LABELS) as [CookingSkill, { label: string; description: string }][]).map(
              ([value, { label, description }]) => (
                <div key={value}>
                  <RadioGroupItem
                    value={value}
                    id={`skill-${value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`skill-${value}`}
                    className="block cursor-pointer"
                  >
                    <Card
                      className={cn(
                        "p-4 border-2 transition-all",
                        profile.cooking_skill === value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{skillIcons[value]}</span>
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

        {/* Household Size */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <Label className="text-lg font-semibold">
              How many are you cooking for?
            </Label>
          </div>
          <RadioGroup
            value={profile.household_size}
            onValueChange={(value) => setHouseholdSize(value as HouseholdSize)}
            className="grid grid-cols-2 gap-3"
          >
            {(Object.entries(HOUSEHOLD_SIZE_LABELS) as [HouseholdSize, string][]).map(
              ([value, label]) => (
                <div key={value}>
                  <RadioGroupItem
                    value={value}
                    id={`size-${value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`size-${value}`}
                    className={cn(
                      "flex flex-col items-center justify-center h-24 rounded-lg border-2 cursor-pointer transition-all",
                      "hover:border-primary/50 hover:bg-primary/5",
                      profile.household_size === value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <span className="text-2xl mb-1">{householdIcons[value]}</span>
                    <span className={cn(
                      "text-sm",
                      profile.household_size === value && "font-semibold text-primary"
                    )}>
                      {label}
                    </span>
                  </Label>
                </div>
              )
            )}
          </RadioGroup>
        </div>

        {profile.household_size === "1" && (
          <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-primary font-medium">
              ✨ "Cooking for One" mode will be enabled - recipes will automatically scale to single servings!
            </p>
          </div>
        )}

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
            disabled={!canProceed}
            className="flex-1 h-14 text-lg font-semibold"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
