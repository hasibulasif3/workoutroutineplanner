import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { WorkoutTemplate } from "./types";
import { TemplateCategory } from "./TemplateCategory";
import { useState } from "react";

interface TemplateListProps {
  templates: WorkoutTemplate[];
  onTemplateSelect: (template: WorkoutTemplate) => void;
}

export function TemplateList({ templates, onTemplateSelect }: TemplateListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const templatesByType = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.type]) {
      acc[template.type] = [];
    }
    acc[template.type].push(template);
    return acc;
  }, {} as Record<string, WorkoutTemplate[]>);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search templates..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {Object.entries(templatesByType).map(([type, templates]) => (
            <TemplateCategory
              key={type}
              title={type.charAt(0).toUpperCase() + type.slice(1)}
              type={type as keyof typeof typeIcons}
              templates={templates}
              onTemplateSelect={onTemplateSelect}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}