import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { 
  DIETARY_RESTRICTION_LABELS, 
  type AgeRange, 
  type DietaryRestriction 
} from "@/types/health-profile";
import { cn } from "@/lib/utils";

const ageRanges: AgeRange[] = ["30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80+"];

export function HealthProfileStep() {
  const { profile, nextStep, prevStep, setAgeRange, toggleDietaryRestriction } = useOnboardingStore();

  const canProceed = profile.age_range !== undefined;

  return (
    <div className="px-6 py-8 animate-fade-in">
      <div className="max-w-lg mx-auto">
        <h1 className="text-heading-md font-bold text-foreground mb-2">
          Tell us about yourself
        </h1>
        <p className="text-muted-foreground mb-8">
          This helps us personalize your meal recommendations.
        </p>

        {/* Age Range */}
        <div className="mb-8">
          <Label className="text-lg font-semibold mb-4 block">
            What's your age range?
          </Label>
          <RadioGroup
            value={profile.age_range}
            onValueChange={(value) => setAgeRange(value as AgeRange)}
            className="grid grid-cols-2 gap-3"
          >
            {ageRanges.map((age) => (
              <div key={age}>
                <RadioGroupItem
                  value={age}
                  id={`age-${age}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`age-${age}`}
                  className={cn(
                    "flex items-center justify-center h-14 rounded-lg border-2 cursor-pointer transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    profile.age_range === age
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border"
                  )}
                >
                  {age}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Dietary Restrictions */}
        <div className="mb-8">
          <Label className="text-lg font-semibold mb-2 block">
            Any dietary considerations?
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Select all that apply (optional)
          </p>
          <div className="grid grid-cols-1 gap-3">
            {(Object.entries(DIETARY_RESTRICTION_LABELS) as [DietaryRestriction, string][]).map(
              ([value, label]) => {
                const isChecked = profile.dietary_restrictions?.includes(value);
                return (
                  <Card
                    key={value}
                    className={cn(
                      "flex items-center gap-4 p-4 cursor-pointer transition-all border-2",
                      isChecked
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                    onClick={() => toggleDietaryRestriction(value)}
                  >
                    <Checkbox
                      id={`diet-${value}`}
                      checked={isChecked}
                      className="h-6 w-6"
                    />
                    <Label
                      htmlFor={`diet-${value}`}
                      className="cursor-pointer text-base flex-1"
                    >
                      {label}
                    </Label>
                  </Card>
                );
              }
            )}
          </div>
        </div>

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
