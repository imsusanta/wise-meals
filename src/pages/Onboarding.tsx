import { Progress } from "@/components/ui/progress";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { WelcomeStep } from "./onboarding/Welcome";
import { HealthProfileStep } from "./onboarding/HealthProfile";
import { AllergiesStep } from "./onboarding/Allergies";
import { CookingPreferencesStep } from "./onboarding/CookingPreferences";
import { BudgetSummaryStep } from "./onboarding/BudgetSummary";

const steps = [
  { component: WelcomeStep, label: "Welcome" },
  { component: HealthProfileStep, label: "Health Profile" },
  { component: AllergiesStep, label: "Allergies" },
  { component: CookingPreferencesStep, label: "Preferences" },
  { component: BudgetSummaryStep, label: "Summary" },
];

export default function Onboarding() {
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const StepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator */}
      {currentStep > 0 && (
        <div className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-medium text-primary">
                {steps[currentStep].label}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 overflow-auto">
        <StepComponent />
      </div>
    </div>
  );
}
