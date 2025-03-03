
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
import { Exercise, WorkoutInput } from "@/types/workout";

interface CreateWorkoutDialogProps {
  onWorkoutCreate: (workout: WorkoutInput) => Promise<void>;
}

export function CreateWorkoutDialog({ onWorkoutCreate }: CreateWorkoutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<WorkoutFormType | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [formSubmissionError, setFormSubmissionError] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  // New state to track if the workout was actually added
  const [workoutAddedSuccessfully, setWorkoutAddedSuccessfully] = useState(false);

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
        setPreviewData(parsed);
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
        setPreviewData({ ...value });
      }
    });
    
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [form.watch, calculateTotalDuration]);

  const onSubmit = async (data: WorkoutFormType) => {
    console.log("Form onSubmit called with data:", data);
    
    // Pre-submission validation
    const validationIssues = [];
    
    if (!data.title || data.title.trim() === "") {
      validationIssues.push("Title is required");
    }

    if (!data.type) {
      validationIssues.push("Type is required");
    }

    if (!data.duration || data.duration.trim() === "") {
      validationIssues.push("Duration is required");
    }
    
    if (!Array.isArray(data.exercises) || data.exercises.length === 0) {
      validationIssues.push("At least one exercise is required");
    }
    
    if (validationIssues.length > 0) {
      const errorMessage = validationIssues.join(", ");
      toast.error("Validation Failed", {
        description: errorMessage
      });
      setFormSubmissionError(errorMessage);
      return;
    }

    setIsSubmitting(true);
    setFormSubmissionError(null);
    setSubmissionStatus('submitting');
    setWorkoutAddedSuccessfully(false);
    
    try {
      console.log("Preparing workout data for submission:", data);
      
      // Create a properly typed WorkoutInput object
      const workoutData: WorkoutInput = {
        title: data.title.trim(),
        type: data.type,
        duration: data.duration,
        difficulty: data.difficulty,
        calories: data.calories || "0",
        notes: data.notes || "",
        exercises: Array.isArray(data.exercises) ? data.exercises.map(exercise => ({
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          restPeriod: exercise.restPeriod,
          equipment: exercise.equipment || [],
          targetMuscles: exercise.targetMuscles || [],
          notes: exercise.notes || "",
          weight: exercise.weight || "",
          rpe: exercise.rpe || ""
        })) : []
      };
      
      console.log("Calling onWorkoutCreate with transformed data:", workoutData);
      
      // Call the parent's workout creation function and wait for it to complete
      await onWorkoutCreate(workoutData);
      
      console.log("Workout creation completed successfully");
      setSubmissionStatus('success');
      setWorkoutAddedSuccessfully(true);
      
      // Reset form and clear storage on success
      form.reset();
      localStorage.removeItem('workout-form-state');
      setPreviewData(null);
      
      // Close dialog only after all operations are complete
      setShowDialog(false);
      
    } catch (error) {
      console.error("Workout creation error:", error);
      setFormSubmissionError(error instanceof Error ? error.message : "Failed to create workout. Please try again.");
      setSubmissionStatus('error');
      setWorkoutAddedSuccessfully(false);
      toast.error("Failed to create workout", {
        description: "There was a problem saving your workout. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (template: typeof workoutTemplates[number]) => {
    const confirmed = window.confirm("Applying a template will reset your current form. Continue?");
    if (confirmed) {
      form.reset(template);
      setPreviewData(template);
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
    // If submitting, don't allow close
    if (submissionStatus === 'submitting') {
      return;
    }
    
    // If form has been successfully submitted, allow immediate close
    if (workoutAddedSuccessfully) {
      setShowDialog(false);
      return;
    }
    
    // Check if form has unsaved changes
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
            if (submissionStatus === 'submitting') {
              e.preventDefault();
              return;
            }
            e.preventDefault();
            handleClose();
          }}
          onEscapeKeyDown={(e) => {
            if (submissionStatus === 'submitting') {
              e.preventDefault();
              return;
            }
            e.preventDefault();
            handleClose();
          }}
        >
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Create New Workout</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new workout routine.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-full px-6 pb-6">
            <FormProgress />
            {submissionStatus === 'error' && formSubmissionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                {formSubmissionError}
              </div>
            )}
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
                    <WorkoutCard 
                      id="preview" 
                      title={previewData.title}
                      duration={previewData.duration}
                      type={previewData.type}
                      difficulty={previewData.difficulty}
                      calories={previewData.calories}
                      exercises={previewData.exercises as Exercise[]}
                      last_modified={new Date().toISOString()}
                    />
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
