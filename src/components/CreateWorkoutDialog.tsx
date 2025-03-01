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
import { Progress } from "@/components/ui/progress";

interface CreateWorkoutDialogProps {
  onWorkoutCreate: (workout: WorkoutFormType) => void;
}

export function CreateWorkoutDialog({ onWorkoutCreate }: CreateWorkoutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const [isAutosaving, setIsAutosaving] = useState(false);

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

  useEffect(() => {
    const formValues = form.getValues();
    const requiredFields = ['title', 'type', 'duration', 'difficulty', 'calories'];
    const filledRequiredFields = requiredFields.filter(field => formValues[field] !== "");
    
    let progress = (filledRequiredFields.length / requiredFields.length) * 70;
    
    if (formValues.exercises && formValues.exercises.length > 0) {
      progress += 30;
    }
    
    setFormProgress(progress);
  }, [form.watch()]);

  useEffect(() => {
    const savedState = localStorage.getItem('workout-form-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        form.reset(parsed);
        setPreviewData({ id: "preview", ...parsed });
        if (parsed.exercises) {
          const duration = calculateTotalDuration(parsed.exercises);
          setTotalDuration(duration);
          form.setValue('duration', String(Math.ceil(duration / 60)));
        }
      } catch (error) {
        console.error('Error parsing saved form state:', error);
        localStorage.removeItem('workout-form-state');
      }
    }
  }, []);

  useEffect(() => {
    const autoSaveTimeout = 1500; // 1.5 seconds
    let timeoutId: NodeJS.Timeout;
    
    const subscription = form.watch((value) => {
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        setIsAutosaving(true);
        
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          try {
            localStorage.setItem('workout-form-state', JSON.stringify(value));
            setIsAutosaving(false);
          } catch (error) {
            console.error('Error autosaving form state:', error);
          }
        }, autoSaveTimeout);
      }
      
      if (value.exercises) {
        const duration = calculateTotalDuration(value.exercises);
        setTotalDuration(duration);
        form.setValue('duration', String(Math.ceil(duration / 60)));
      }
      
      if (value.title) {
        setPreviewData({ id: "preview", ...value });
      }
    });
    
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [form.watch, calculateTotalDuration]);

  const onSubmit = async (data: WorkoutFormType) => {
    if (!data.exercises || data.exercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onWorkoutCreate(data);
      
      form.reset();
      localStorage.removeItem('workout-form-state');
      setShowDialog(false);
      setPreviewData(null);
      
      toast.success("Workout created successfully!", {
        description: "Your workout has been added to Monday's schedule.",
        duration: 4000
      });
    } catch (error) {
      console.error("Workout creation error:", error);
      toast.error("Failed to create workout", {
        description: "There was a problem saving your workout. Please try again.",
        duration: 4000
      });
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
        form.setValue('duration', String(Math.ceil(duration / 60)));
      }
      toast.success("Template applied", { 
        description: `${template.title} template has been applied.`,
        duration: 3000
      });
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

  const FormProgress = () => (
    <div className="space-y-2 mb-4">
      <Progress value={formProgress} className="h-1" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Form completion: {Math.round(formProgress)}%</span>
        {isAutosaving && (
          <span className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Autosaving...
          </span>
        )}
      </div>
    </div>
  );

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
            <FormProgress />
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
                  isAutosaving={isAutosaving}
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
