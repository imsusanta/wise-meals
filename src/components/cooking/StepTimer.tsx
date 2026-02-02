import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepTimerProps {
  minutes: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function StepTimer({ minutes, onComplete, autoStart = false }: StepTimerProps) {
  const totalSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, onComplete]);

  const toggleTimer = useCallback(() => {
    if (isComplete) {
      // Reset timer
      setSecondsLeft(totalSeconds);
      setIsComplete(false);
      setIsRunning(true);
    } else {
      setIsRunning((prev) => !prev);
    }
  }, [isComplete, totalSeconds]);

  const resetTimer = useCallback(() => {
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
    setIsComplete(false);
  }, [totalSeconds]);

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border">
      <div className="relative flex items-center justify-center">
        {/* Progress ring */}
        <svg className="w-16 h-16 -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
            className={cn(
              "transition-all duration-1000",
              isComplete ? "text-green-500" : "text-primary"
            )}
            strokeLinecap="round"
          />
        </svg>
        <Timer className={cn(
          "absolute w-6 h-6",
          isComplete ? "text-green-500" : "text-primary"
        )} />
      </div>

      <div className="flex-1">
        <p className={cn(
          "text-2xl font-bold tabular-nums",
          isComplete && "text-green-500"
        )}>
          {formatTime(secondsLeft)}
        </p>
        <p className="text-sm text-muted-foreground">
          {isComplete ? "Timer complete!" : `${minutes} min timer`}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          size="icon"
          variant={isComplete ? "default" : isRunning ? "secondary" : "default"}
          onClick={toggleTimer}
          className="h-10 w-10"
        >
          {isComplete ? (
            <RotateCcw className="h-5 w-5" />
          ) : isRunning ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        {!isComplete && secondsLeft !== totalSeconds && (
          <Button
            size="icon"
            variant="outline"
            onClick={resetTimer}
            className="h-10 w-10"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
