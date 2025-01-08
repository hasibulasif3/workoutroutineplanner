import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { WorkoutCard } from "./WorkoutCard";

const workoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["strength", "cardio", "flexibility"]),
  duration: z.string().min(1, "Duration is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  calories: z.string().min(1, "Estimated calories is required"),
});

type WorkoutForm = z.infer<typeof workoutSchema>;

interface CreateWorkoutDialogProps {
  onWorkoutCreate: (workout: WorkoutForm) => void;
}

const workoutTemplates = [
  {
    title: "Morning Run",
    type: "cardio",
    duration: "30",
    difficulty: "beginner",
    calories: "300",
  },
  {
    title: "Full Body Workout",
    type: "strength",
    duration: "45",
    difficulty: "intermediate",
    calories: "400",
  },
  {
    title: "Yoga Flow",
    type: "flexibility",
    duration: "60",
    difficulty: "beginner",
    calories: "200",
  },
] as const;

export function CreateWorkoutDialog({ onWorkoutCreate }: CreateWorkoutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const form = useForm<WorkoutForm>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      title: "",
      type: "strength",
      duration: "",
      difficulty: "beginner",
      calories: "",
    },
  });

  const onSubmit = async (data: WorkoutForm) => {
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Workout</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-4">Quick Templates</h3>
            <div className="space-y-2">
              {workoutTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => applyTemplate(template)}
                >
                  {template.title}
                </Button>
              ))}
            </div>
          </div>
          <Form {...form}>
            <form onChange={handleFormChange} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Morning Run" {...field} className="transition-all duration-200 focus:scale-105" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="30" {...field} />
                  </FormControl>
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
            <FormField
              control={form.control}
              name="calories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Calories</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="150" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

              <Button 
                type="submit" 
                className="w-full relative overflow-hidden transition-all duration-300 hover:scale-105"
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
        </div>
        {previewData && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-4">Preview</h3>
            <WorkoutCard {...previewData} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
