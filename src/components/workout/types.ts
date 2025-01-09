import { z } from "zod";

export const workoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["strength", "cardio", "flexibility"]),
  duration: z.string().min(1, "Duration is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  calories: z.string().min(1, "Estimated calories is required"),
});

export type WorkoutForm = z.infer<typeof workoutSchema>;