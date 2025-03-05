
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, X } from "lucide-react";
import { UseFormReturn, useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExerciseForm } from "./ExerciseForm";
import { Exercise, WorkoutFormType, muscleGroups, equipmentList } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkoutFormProps {
  form: UseFormReturn<WorkoutFormType>;
  onSubmit: (data: WorkoutFormType) => void;
  isSubmitting: boolean;
  totalDuration: number;
  isAutosaving?: boolean;
}

export function WorkoutForm({ form, onSubmit, isSubmitting, totalDuration, isAutosaving }: WorkoutFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  
  const exerciseForm = useForm<Exercise>({
    defaultValues: {
      name: "",
      sets: "",
      reps: "",
      restPeriod: "",
      equipment: [],
      targetMuscles: [],
      notes: "",
      weight: "",
      rpe: "",
    }
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="exercises">
              Exercises 
              {form.watch("exercises")?.length > 0 && 
                <Badge variant="secondary" className="ml-2">{form.watch("exercises")?.length}</Badge>
              }
            </TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Morning Workout" {...field} />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="flexibility">Flexibility</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-sm text-red-500" />
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
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30" 
                        {...field} 
                        disabled={form.watch("exercises")?.length > 0}
                        title={form.watch("exercises")?.length > 0 ? "Duration is calculated from exercises" : ""}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="300" {...field} />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-4">
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

            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-2">
                {form.watch("exercises")?.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No exercises added. Click "Add Exercise" to start building your workout.
                  </div>
                )}
                
                {form.watch("exercises")?.map((exercise, index) => (
                  <Card key={index} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-start">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="warmupDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warm-up (min)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5" {...field} />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
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
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
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
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Workout...
            </div>
          ) : (
            "Create Workout"
          )}
        </Button>
      </form>
    </Form>
  );
}
