import { Exercise } from "./types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { muscleGroups, equipmentList } from "./types";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExerciseFormProps {
  form: UseFormReturn<Exercise>;
  onSubmit: (data: Exercise) => void;
  onCancel: () => void;
  existingExercises?: Exercise[];
}

export function ExerciseForm({ form, onSubmit, onCancel, existingExercises = [] }: ExerciseFormProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [formState, setFormState] = useState<Exercise | null>(null);

  // Persist form state
  useEffect(() => {
    const savedState = localStorage.getItem('exercise-form-state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      form.reset(parsed);
      setFormState(parsed);
    }
  }, []);

  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('exercise-form-state', JSON.stringify(value));
      setFormState(value as Exercise);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handleSubmit = (data: Exercise) => {
    // Check for duplicate exercise names
    const isDuplicate = existingExercises.some(
      ex => ex.name.toLowerCase() === data.name.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("An exercise with this name already exists");
      return;
    }

    onSubmit(data);
    localStorage.removeItem('exercise-form-state');
  };

  const handleCancel = () => {
    if (formState && Object.keys(formState).some(key => formState[key])) {
      setShowCancelDialog(true);
    } else {
      onCancel();
    }
  };

  return (
    <ScrollArea className="h-[500px] pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Exercise Name
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Bench Press" {...field} className="text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="sets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Sets
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="1-10" 
                      {...field} 
                      className="text-base"
                      min={1}
                      max={10}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Reps
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="1-100" 
                      {...field} 
                      className="text-base"
                      min={1}
                      max={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="restPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Rest Period (seconds)
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="5-300" 
                    {...field} 
                    className="text-base"
                    min={5}
                    max={300}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Add Exercise</Button>
            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
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
              localStorage.removeItem('exercise-form-state');
              form.reset();
              onCancel();
            }}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollArea>
  );
}