import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Clock, Dumbbell, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExerciseForm } from "./ExerciseForm";
import { Exercise, WorkoutFormType, muscleGroups, equipmentList } from "./types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { exerciseSchema } from "./types";

interface WorkoutFormProps {
  form: UseFormReturn<WorkoutFormType>;
  onSubmit: (data: WorkoutFormType) => void;
  isSubmitting: boolean;
}

export function WorkoutForm({ form, onSubmit, isSubmitting }: WorkoutFormProps) {
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const exerciseForm = useForm<Exercise>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      sets: "",
      reps: "",
      restPeriod: "",
    },
  });

  const handleExerciseSubmit = (exercise: Exercise) => {
    const currentExercises = form.getValues("exercises") || [];
    form.setValue("exercises", [...currentExercises, exercise]);
    setIsAddingExercise(false);
    exerciseForm.reset();
  };

  const removeExercise = (index: number) => {
    const currentExercises = form.getValues("exercises") || [];
    form.setValue("exercises", currentExercises.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onChange={() => form.getValues()} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Morning Workout" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workout type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="warmupDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warm-up (min)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Duration (min)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cooldownDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cool-down (min)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="restBetweenExercises"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rest Between Exercises (seconds)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="60" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Exercises</h3>
            <Dialog open={isAddingExercise} onOpenChange={setIsAddingExercise}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Exercise</DialogTitle>
                </DialogHeader>
                <ExerciseForm
                  form={exerciseForm}
                  onSubmit={handleExerciseSubmit}
                  onCancel={() => setIsAddingExercise(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {form.watch("exercises")?.map((exercise, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg bg-card"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">{exercise.name}</h4>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>{exercise.sets} sets</span>
                    <span>×</span>
                    <span>{exercise.reps} reps</span>
                    <span>|</span>
                    <span>{exercise.restPeriod}s rest</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExercise(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about the workout..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Create Workout"
          )}
        </Button>
      </form>
    </Form>
  );
}
