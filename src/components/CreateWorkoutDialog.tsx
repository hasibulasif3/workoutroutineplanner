import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState } from "react";
import { WorkoutCard } from "./WorkoutCard";
import { workoutSchema, WorkoutFormType } from "./workout/types";
import { WorkoutForm } from "./workout/WorkoutForm";
import { TemplateList } from "./workout/TemplateList";
import { workoutTemplates } from "./workout/templates";

interface CreateWorkoutDialogProps {
  onWorkoutCreate: (workout: WorkoutFormType) => void;
}

export function CreateWorkoutDialog({ onWorkoutCreate }: CreateWorkoutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const form = useForm<WorkoutFormType>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      title: "",
      type: "strength",
      duration: "",
      difficulty: "beginner",
      calories: "",
    },
  });

  const onSubmit = async (data: WorkoutFormType) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onWorkoutCreate(data);
      form.reset();
      toast.success("Workout created successfully!");
    } catch (error) {
      toast.error("Failed to create workout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (template: typeof workoutTemplates[number]) => {
    form.reset(template);
    setPreviewData({ id: "preview", ...template });
  };

  const handleFormChange = () => {
    const values = form.getValues();
    if (values.title) {
      setPreviewData({ id: "preview", ...values });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2 animate-fade-in hover:scale-105 transition-transform">
          <Plus size={16} />
          Add Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create New Workout</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="max-h-[600px] overflow-y-auto pr-4">
            <h3 className="text-sm font-medium mb-4">Quick Templates</h3>
            <TemplateList templates={workoutTemplates} onTemplateSelect={applyTemplate} />
          </div>
          <div>
            <WorkoutForm
              form={form}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
            {previewData && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-4">Preview</h3>
                <WorkoutCard {...previewData} />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
