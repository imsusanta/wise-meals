import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Volume2, 
  VolumeX,
  Check,
  ChefHat
} from "lucide-react";
import { StepTimer } from "./StepTimer";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { cn } from "@/lib/utils";
import type { GeneratedRecipe } from "@/hooks/useRecipeGenerator";

interface CookingModeProps {
  recipe: GeneratedRecipe;
  onClose: () => void;
}

export function CookingMode({ recipe, onClose }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [autoRead, setAutoRead] = useState(true);
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis({ rate: 0.85 });

  const instructions = recipe.instructions;
  const totalSteps = instructions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentInstruction = instructions[currentStep];

  // Read current step aloud when it changes
  useEffect(() => {
    if (autoRead && isSupported) {
      const stepText = `Step ${currentInstruction.step}. ${currentInstruction.text}`;
      speak(stepText);
    }
    return () => stop();
  }, [currentStep, autoRead]);

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const toggleStep = (stepIndex: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  };

  const readCurrentStep = () => {
    const stepText = `Step ${currentInstruction.step}. ${currentInstruction.text}`;
    speak(stepText);
  };

  const isLastStep = currentStep === totalSteps - 1;
  const allCompleted = completedSteps.size === totalSteps;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <div className="text-center flex-1 px-4">
          <h1 className="font-semibold truncate">{recipe.title}</h1>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>
        {isSupported && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              if (isSpeaking) {
                stop();
              }
              setAutoRead(!autoRead);
            }}
          >
            {autoRead ? (
              <Volume2 className="h-5 w-5 text-primary" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
        )}
      </header>

      {/* Progress bar */}
      <Progress value={progress} className="h-1 rounded-none" />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Step indicator */}
          <div className="flex items-center justify-center">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all",
              completedSteps.has(currentStep) 
                ? "bg-green-500/20 text-green-500" 
                : "bg-primary/10 text-primary"
            )}>
              {completedSteps.has(currentStep) ? (
                <Check className="w-8 h-8" />
              ) : (
                currentInstruction.step
              )}
            </div>
          </div>

          {/* Instruction text */}
          <div 
            className={cn(
              "text-center p-6 rounded-2xl transition-all",
              "bg-muted/30 border"
            )}
          >
            <p className="text-xl leading-relaxed font-medium">
              {currentInstruction.text}
            </p>
          </div>

          {/* Read aloud button */}
          {isSupported && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={readCurrentStep}
              disabled={isSpeaking}
            >
              <Volume2 className={cn("h-4 w-4", isSpeaking && "animate-pulse")} />
              {isSpeaking ? "Reading..." : "Read Aloud"}
            </Button>
          )}

          {/* Timer if step has time */}
          {currentInstruction.time_minutes && currentInstruction.time_minutes > 0 && (
            <StepTimer 
              minutes={currentInstruction.time_minutes} 
              onComplete={() => {
                if (isSupported && autoRead) {
                  speak("Timer complete! Ready for the next step.");
                }
              }}
            />
          )}

          {/* Mark as complete */}
          <Button
            variant={completedSteps.has(currentStep) ? "secondary" : "outline"}
            className="w-full gap-2"
            onClick={() => toggleStep(currentStep)}
          >
            <Check className={cn(
              "h-4 w-4",
              completedSteps.has(currentStep) && "text-green-500"
            )} />
            {completedSteps.has(currentStep) ? "Completed" : "Mark as Complete"}
          </Button>

          {/* Completion celebration */}
          {allCompleted && isLastStep && (
            <div className="text-center p-6 rounded-2xl bg-green-500/10 border border-green-500/20">
              <ChefHat className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <h3 className="text-xl font-bold text-green-500 mb-2">
                Congratulations! 🎉
              </h3>
              <p className="text-muted-foreground">
                You've completed all the steps. Enjoy your meal!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation footer */}
      <footer className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-14 text-lg"
            onClick={goToPrevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>
          {isLastStep ? (
            <Button
              className="flex-1 h-14 text-lg bg-green-500 hover:bg-green-600"
              onClick={onClose}
            >
              <Check className="mr-2 h-5 w-5" />
              Done
            </Button>
          ) : (
            <Button
              className="flex-1 h-14 text-lg"
              onClick={goToNextStep}
            >
              Next
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
