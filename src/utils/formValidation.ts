import { z } from "zod";

export const exerciseSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  sets: z.string().refine(val => {
    const num = parseInt(val);
    return num > 0 && num <= 10;
  }, "Sets must be between 1 and 10"),
  reps: z.string().refine(val => {
    const num = parseInt(val);
    return num > 0 && num <= 100;
  }, "Reps must be between 1 and 100"),
  restPeriod: z.string().refine(val => {
    const num = parseInt(val);
    return num >= 5 && num <= 300;
  }, "Rest period must be between 5 and 300 seconds"),
  equipment: z.array(z.string()).optional(),
  targetMuscles: z.array(z.string()).optional(),
  notes: z.string().max(1000, "Notes are too long").optional(),
  weight: z.string().optional(),
  rpe: z.string().optional(),
});

export const workoutSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title is too long"),
  type: z.enum(["strength", "cardio", "flexibility"]),
  duration: z.string().refine(val => {
    const num = parseInt(val);
    return num > 0;
  }, "Duration must be positive"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  calories: z.string().optional(),
  warmupDuration: z.string()
    .refine(val => !val || parseInt(val) > 0, "Warmup duration must be positive")
    .optional(),
  cooldownDuration: z.string()
    .refine(val => !val || parseInt(val) > 0, "Cooldown duration must be positive")
    .optional(),
  restBetweenExercises: z.string()
    .refine(val => !val || parseInt(val) > 0, "Rest period must be positive")
    .optional(),
  exercises: z.array(exerciseSchema),
  notes: z.string().max(1000, "Notes are too long").optional(),
});