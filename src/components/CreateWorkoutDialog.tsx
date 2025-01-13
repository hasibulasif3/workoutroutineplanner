import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { WorkoutCard } from "./WorkoutCard";
import { workoutSchema, WorkoutFormType } from "./workout/types";
import { WorkoutForm } from "./workout/WorkoutForm";
import { TemplateList } from "./workout/TemplateList";
import { workoutTemplates } from "./workout/templates";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CreateWorkoutDialogProps {
  onWorkoutCreate: (workout: WorkoutFormType) => void;
}

export function CreateWorkoutDialog({ onWorkoutCreate }: CreateWorkoutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const form = useForm<WorkoutFormType>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      title: "",
      type: "strength",
      duration: "",
      difficulty: "beginner",
      calories: "",
      warmupDuration: "",
      cooldownDuration: "",
      restBetweenExercises: "",
      exercises: [],
      notes: "",
    },
  });

  // Load saved form state
  useEffect(() => {
    const savedState = localStorage.getItem('workout-form-state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      form.reset(parsed);
      setPreviewData({ id: "preview", ...parsed });
    }
  }, []);

  // Save form state on changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('workout-form-state', JSON.stringify(value));
      if (value.title) {
        setPreviewData({ id: "preview", ...value });
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: WorkoutFormType) => {
    if (!data.exercises || data.exercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onWorkoutCreate(data);
      form.reset();
      localStorage.removeItem('workout-form-state');
      setShowDialog(false);
      toast.success("Workout created successfully!");
    } catch (error) {
      toast.error("Failed to create workout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (template: typeof workoutTemplates[number]) => {
    const confirmed = window.confirm("Applying a template will reset your current form. Continue?");
    if (confirmed) {
      form.reset(template);
      setPreviewData({ id: "preview", ...template });
      localStorage.setItem('workout-form-state', JSON.stringify(template));
    }
  };

  const handleClose = () => {
    const formValues = form.getValues();
    const hasValues = Object.values(formValues).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== "" && value !== undefined;
    });

    if (hasValues) {
      setShowDiscardDialog(true);
    } else {
      setShowDialog(false);
    }
  };

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button className="gap-2 animate-fade-in hover:scale-105 transition-transform">
            <Plus size={16} />
            Add Workout
          </Button>
        </DialogTrigger>
        <DialogContent 
          className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => {
            e.preventDefault();
            handleClose();
          }}
        >
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

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              localStorage.removeItem('workout-form-state');
              form.reset();
              setShowDialog(false);
              setShowDiscardDialog(false);
            }}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}