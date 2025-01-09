import { z } from "zod";

export const workoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["strength", "cardio", "flexibility"]),
  duration: z.string().min(1, "Duration is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  calories: z.string().min(1, "Estimated calories is required"),
  targetMuscles: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  frequency: z.string().optional(),
  notes: z.string().optional(),
  spaceRequired: z.enum(["minimal", "moderate", "spacious"]).optional(),
  intensity: z.enum(["low", "medium", "high"]).optional(),
});

export type WorkoutFormType = z.infer<typeof workoutSchema>;
export type WorkoutForm = WorkoutFormType; // Add this line to maintain compatibility

export interface WorkoutTemplate extends WorkoutFormType {
  category: string;
  description: string;
  benefits: string[];
  alternatives?: string[];
  tips?: string[];
}