import { Button } from "@/components/ui/button";
import { WorkoutTemplate } from "./templates";

interface TemplateListProps {
  templates: readonly WorkoutTemplate[];
  onTemplateSelect: (template: WorkoutTemplate) => void;
}

export function TemplateList({ templates, onTemplateSelect }: TemplateListProps) {
  const templatesByType = templates.reduce((acc, template) => {
    const type = template.type.charAt(0).toUpperCase() + template.type.slice(1);
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(template);
    return acc;
  }, {} as Record<string, WorkoutTemplate[]>);

  return (
    <div className="space-y-4">
      {Object.entries(templatesByType).map(([type, templates]) => (
        <div key={type}>
          <h3 className="text-sm font-medium mb-2">{type}</h3>
          <div className="space-y-2">
            {templates.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => onTemplateSelect(template)}
              >
                <div className="flex flex-col items-start">
                  <span>{template.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {template.duration}min • {template.difficulty} • {template.calories} cal
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}