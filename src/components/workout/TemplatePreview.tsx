
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Dumbbell, Target, Flame, Zap } from "lucide-react";
import { WorkoutTemplate } from "./types";

interface TemplatePreviewProps {
  template: WorkoutTemplate;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{template.title}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </div>
          <Badge variant={template.difficulty === "beginner" ? "secondary" : template.difficulty === "intermediate" ? "default" : "destructive"}>
            {template.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4 pt-0">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {template.duration} min
              </div>
              <div className="flex items-center">
                <Flame className="mr-1 h-4 w-4" />
                {template.calories} cal
              </div>
              <div className="flex items-center">
                <Zap className="mr-1 h-4 w-4" />
                {template.intensity}
              </div>
              {template.frequency && (
                <div className="flex items-center">
                  <Target className="mr-1 h-4 w-4" />
                  {template.frequency}
                </div>
              )}
            </div>

            {template.equipment && template.equipment.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Equipment</h4>
                <div className="flex flex-wrap gap-1">
                  {template.equipment.map((item) => (
                    <Badge key={item} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {template.targetMuscles && template.targetMuscles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Target Muscles</h4>
                <div className="flex flex-wrap gap-1">
                  {template.targetMuscles.map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {template.benefits && template.benefits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Benefits</h4>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  {template.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {template.tips && template.tips.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Tips</h4>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  {template.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {template.exercises && template.exercises.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Exercises</h4>
                <ul className="space-y-2">
                  {template.exercises.map((exercise, index) => (
                    <li key={index} className="border rounded p-2 text-sm">
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {exercise.sets} sets × {exercise.reps} reps
                        {exercise.restPeriod ? ` • ${exercise.restPeriod}s rest` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
