import { z } from "zod";

export const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  sets: z.string()
    .min(1, "Sets are required")
    .refine(val => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 10;
    }, "Sets must be between 1 and 10"),
  reps: z.string()
    .min(1, "Reps are required")
    .refine(val => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 100;
    }, "Reps must be between 1 and 100"),
  restPeriod: z.string()
    .min(1, "Rest period is required")
    .refine(val => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 5 && num <= 300;
    }, "Rest period must be between 5 and 300 seconds"),
  equipment: z.array(z.string()).optional(),
  targetMuscles: z.array(z.string()).optional(),
  notes: z.string().optional(),
  weight: z.string()
    .optional()
    .refine(val => !val || (parseInt(val) >= 0 && parseInt(val) <= 1000), 
      "Weight must be between 0 and 1000"),
  rpe: z.string().optional(),
});

export const workoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["strength", "cardio", "flexibility"]),
  duration: z.string().min(1, "Duration is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  calories: z.string().min(1, "Estimated calories is required"),
  warmupDuration: z.string().optional(),
  cooldownDuration: z.string().optional(),
  restBetweenExercises: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, "At least one exercise is required"),
  notes: z.string().optional(),
});

export type Exercise = z.infer<typeof exerciseSchema>;
export type WorkoutFormType = z.infer<typeof workoutSchema>;

export interface WorkoutTemplate extends WorkoutFormType {
  category: string;
  description: string;
  benefits: string[];
  alternatives?: string[];
  tips?: string[];
  frequency: string;
  intensity: string;
  spaceRequired?: string;
  equipment?: string[];
  targetMuscles?: string[];
}

export const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Core",
  "Full Body",
] as const;

export const equipmentList = [
  "Dumbbells",
  "Barbell",
  "Kettlebell",
  "Resistance Bands",
  "Bodyweight",
  "Machine",
  "Yoga Mat",
  "Pull-up Bar",
  "Bench",
] as const;

export const rpeScale = [
  { value: "6", label: "Very Light (RPE 6)" },
  { value: "7", label: "Moderate (RPE 7)" },
  { value: "8", label: "Hard (RPE 8)" },
  { value: "9", label: "Very Hard (RPE 9)" },
  { value: "10", label: "Maximum Effort (RPE 10)" },
] as const;
