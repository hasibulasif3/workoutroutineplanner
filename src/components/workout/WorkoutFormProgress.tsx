import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface WorkoutFormProgressProps {
  isSubmitting: boolean;
  progress: number;
  isAutosaving: boolean;
}

export function WorkoutFormProgress({ 
  isSubmitting, 
  progress, 
  isAutosaving 
}: WorkoutFormProgressProps) {
  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-1" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Progress: {Math.round(progress)}%</span>
        {isAutosaving && (
          <span className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Autosaving...
          </span>
        )}
        {isSubmitting && (
          <span className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Creating workout...
          </span>
        )}
      </div>
    </div>
  );
}