import { z } from "zod";

export const workoutSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  type: z.enum(["strength", "cardio", "flexibility"]),
  duration: z.string().min(1, "Duration is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  calories: z.string().min(1, "Estimated calories is required"),
  notes: z.string().optional(),
  exercises: z.array(z.object({
    name: z.string().min(1, "Exercise name is required"),
    sets: z.string().min(1, "Sets are required"),
    reps: z.string().min(1, "Reps are required"),
    restPeriod: z.string().min(1, "Rest period is required"),
  })).optional(),
});

export type WorkoutValidationType = z.infer<typeof workoutSchema>;