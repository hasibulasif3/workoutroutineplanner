import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { WorkoutCard } from "./WorkoutCard";
import { workoutSchema, WorkoutFormType } from "./workout/types";
import { WorkoutForm } from "./workout/WorkoutForm";
import { TemplateList } from "./workout/TemplateList";
import { workoutTemplates } from "./workout/templates";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateWorkoutDialogProps {
  onWorkoutCreate: (workout: WorkoutFormType) => void;
}

export function CreateWorkoutDialog({ onWorkoutCreate }: CreateWorkoutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);

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

  const calculateTotalDuration = useCallback((exercises) => {
    return exercises.reduce((total, exercise) => {
      const setTime = (Number(exercise.sets) * Number(exercise.reps) * 3); // 3s per rep
      const restTime = Number(exercise.restPeriod) * (Number(exercise.sets) - 1);
      return total + setTime + restTime;
    }, 0);
  }, []);

  // Load saved form state
  useEffect(() => {
    const savedState = localStorage.getItem('workout-form-state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      form.reset(parsed);
      setPreviewData({ id: "preview", ...parsed });
      if (parsed.exercises) {
        const duration = calculateTotalDuration(parsed.exercises);
        setTotalDuration(duration);
        form.setValue('duration', String(Math.ceil(duration / 60))); // Convert to minutes
      }
    }
  }, []);

  // Save form state on changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('workout-form-state', JSON.stringify(value));
      if (value.exercises) {
        const duration = calculateTotalDuration(value.exercises);
        setTotalDuration(duration);
        form.setValue('duration', String(Math.ceil(duration / 60))); // Convert to minutes
      }
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
      if (template.exercises) {
        const duration = calculateTotalDuration(template.exercises);
        setTotalDuration(duration);
        form.setValue('duration', String(Math.ceil(duration / 60))); // Convert to minutes
      }
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
          className="sm:max-w-[800px] h-[90vh] p-0"
          onInteractOutside={(e) => {
            e.preventDefault();
            handleClose();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            handleClose();
          }}
        >
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Create New Workout</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-4">Quick Templates</h3>
                <TemplateList templates={workoutTemplates} onTemplateSelect={applyTemplate} />
              </div>
              <div className="space-y-6">
                <WorkoutForm
                  form={form}
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                  totalDuration={totalDuration}
                />
                {previewData && (
                  <div>
                    <h3 className="text-sm font-medium mb-4">Preview</h3>
                    <WorkoutCard {...previewData} />
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
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