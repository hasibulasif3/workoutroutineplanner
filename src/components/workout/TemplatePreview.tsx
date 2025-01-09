import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dumbbell, Clock, Flame, Target, Box, RefreshCcw } from "lucide-react";
import { WorkoutTemplate } from "./types";

interface TemplatePreviewProps {
  template: WorkoutTemplate;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  return (
    <Card className="bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{template.title}</span>
          <Badge variant="outline" className="ml-auto">
            {template.type}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{template.duration} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-muted-foreground" />
            <span>{template.calories} cal</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="capitalize">{template.difficulty}</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCcw className="w-4 h-4 text-muted-foreground" />
            <span>{template.frequency}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Description</h4>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>

        {template.equipment && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Box className="w-4 h-4" />
              Equipment Needed
            </h4>
            <div className="flex flex-wrap gap-2">
              {template.equipment.map((item) => (
                <Badge key={item} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {template.targetMuscles && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Target Muscles
            </h4>
            <div className="flex flex-wrap gap-2">
              {template.targetMuscles.map((muscle) => (
                <Badge key={muscle} variant="outline">
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {template.benefits && (
          <div className="space-y-2">
            <h4 className="font-medium">Benefits</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
              {template.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        {template.tips && (
          <div className="space-y-2">
            <h4 className="font-medium">Tips</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
              {template.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}