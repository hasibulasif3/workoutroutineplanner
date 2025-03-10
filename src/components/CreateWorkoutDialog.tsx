import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState, useEffect, useCallback, useRef } from "react";
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
  isCreatingWorkout?: boolean;
}

export function CreateWorkoutDialog({ onWorkoutCreate, isCreatingWorkout = false }: CreateWorkoutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<WorkoutFormType | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [formSubmissionError, setFormSubmissionError] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const isMountedRef = useRef(true);

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

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const calculateTotalDuration = useCallback((exercises) => {
    if (!Array.isArray(exercises)) return 0;
    
    return exercises.reduce((total, exercise) => {
      const sets = Number(exercise.sets) || 0;
      const reps = Number(exercise.reps) || 0;
      const restPeriod = Number(exercise.restPeriod) || 0;
      
      const setTime = (sets * reps * 3); // 3s per rep
      const restTime = restPeriod * (sets - 1);
      return total + setTime + restTime;
    }, 0);
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;
    
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
    if (!isMountedRef.current) return;
    
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
        console.error('[CreateWorkoutDialog] Error parsing saved form state:', error);
        localStorage.removeItem('workout-form-state');
      }
    }
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const autoSaveTimeout = 1500; // 1.5 seconds
    let timeoutId: NodeJS.Timeout;
    
    const subscription = form.watch((value) => {
      if (!isMountedRef.current) return;
      
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        setIsAutosaving(true);
        
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          if (!isMountedRef.current) return;
          
          try {
            localStorage.setItem('workout-form-state', JSON.stringify(value));
            console.log('[CreateWorkoutDialog] Form state autosaved successfully');
            setIsAutosaving(false);
          } catch (error) {
            console.error('[CreateWorkoutDialog] Error autosaving form state:', error);
            if (isMountedRef.current) {
              setIsAutosaving(false);
            }
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

  const validateFormData = (data: WorkoutFormType): string[] => {
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
    
    return validationIssues;
  };

  const onSubmit = async (data: WorkoutFormType) => {
    if (!isMountedRef.current) return;
    
    console.log("[CreateWorkoutDialog] Form onSubmit called with data:", data);
    
    const validationIssues = validateFormData(data);
    
    if (validationIssues.length > 0) {
      const errorMessage = validationIssues.join(", ");
      console.error("[CreateWorkoutDialog] Validation failed:", errorMessage);
      toast.error("Validation Failed", {
        description: errorMessage
      });
      setFormSubmissionError(errorMessage);
      return;
    }

    if (isSubmitting || isCreatingWorkout) {
      console.warn("[CreateWorkoutDialog] Submission already in progress");
      return;
    }

    setIsSubmitting(true);
    setFormSubmissionError(null);
    setSubmissionStatus('submitting');
    
    toast("Creating workout...", {
      description: "Please wait while we create your workout."
    });
    
    try {
      console.log("[CreateWorkoutDialog] Preparing workout data for submission:", data);
      
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
      
      console.log("[CreateWorkoutDialog] Calling onWorkoutCreate with transformed data:", workoutData);
      
      try {
        await onWorkoutCreate(workoutData);
        
        if (!isMountedRef.current) return;
        
        console.log("[CreateWorkoutDialog] Workout creation completed successfully");
        setSubmissionStatus('success');
        
        toast.success("Workout Created", {
          description: `"${workoutData.title}" has been created successfully.`
        });
        
        form.reset();
        localStorage.removeItem('workout-form-state');
        setPreviewData(null);
        
        setShowDialog(false);
      } catch (error) {
        throw error;
      }
      
    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.error("[CreateWorkoutDialog] Workout creation error:", error);
      setFormSubmissionError(error instanceof Error ? error.message : String(error));
      setSubmissionStatus('error');
      toast.error("Failed to create workout", {
        description: "There was a problem saving your workout. Please try again."
      });
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
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
    if (submissionStatus === 'submitting' || isCreatingWorkout) {
      console.log("[CreateWorkoutDialog] Cannot close dialog while submitting or creating workout");
      return;
    }
    
    if (submissionStatus === 'success') {
      setShowDialog(false);
      return;
    }
    
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
          <Button 
            className="gap-2 animate-fade-in hover:scale-105 transition-transform" 
            disabled={isCreatingWorkout || isSubmitting}
            onClick={() => {
              setSubmissionStatus('idle');
              setFormSubmissionError(null);
              setShowDialog(true);
            }}
          >
            {isCreatingWorkout ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Workout
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent 
          className="sm:max-w-[800px] h-[90vh] p-0"
          onInteractOutside={(e) => {
            if (submissionStatus === 'submitting' || isCreatingWorkout) {
              e.preventDefault();
              return;
            }
            e.preventDefault();
            handleClose();
          }}
          onEscapeKeyDown={(e) => {
            if (submissionStatus === 'submitting' || isCreatingWorkout) {
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
            
            {isCreatingWorkout && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-md flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating your workout, please wait...
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
                  isSubmitting={isSubmitting || isCreatingWorkout}
                  totalDuration={totalDuration}
                  isAutosaving={isAutosaving}
                />
                {previewData && (
                  <div>
                    <h3 className="text-sm font-medium mb-4">Preview</h3>
                    <WorkoutCard 
                      id="preview" 
                      title={previewData.title || "New Workout"}
                      duration={previewData.duration || "0"}
                      type={previewData.type || "strength"}
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
