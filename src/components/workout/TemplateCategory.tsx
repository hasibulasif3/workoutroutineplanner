import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutTemplate } from "./types";
import { Dumbbell, Heart, Activity } from "lucide-react";
import { motion } from "framer-motion";

const typeIcons = {
  strength: Dumbbell,
  cardio: Activity,
  flexibility: Heart,
};

const typeColors = {
  strength: "bg-primary/10 text-primary hover:bg-primary/20",
  cardio: "bg-secondary/10 text-secondary hover:bg-secondary/20",
  flexibility: "bg-accent/10 text-accent hover:bg-accent/20",
};

interface TemplateCategoryProps {
  title: string;
  type: keyof typeof typeIcons;
  templates: WorkoutTemplate[];
  onTemplateSelect: (template: WorkoutTemplate) => void;
}

export function TemplateCategory({ title, type, templates, onTemplateSelect }: TemplateCategoryProps) {
  const Icon = typeIcons[type];

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-muted">
      <CardHeader className="flex flex-row items-center space-x-2">
        <Icon className="w-6 h-6" />
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {templates.map((template, index) => (
          <motion.div
            key={template.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              className={`w-full justify-start text-left ${typeColors[type]}`}
              onClick={() => onTemplateSelect(template)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{template.title}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{template.duration}min</span>
                  <span>•</span>
                  <span className="capitalize">{template.difficulty}</span>
                  <span>•</span>
                  <span>{template.calories} cal</span>
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}