
import { z } from "zod";
import { WorkoutDifficulty, WorkoutType } from "@/types/workout";

// Rename this to prevent conflict with the Exercise import
export type ExerciseType = import("@/types/workout").Exercise;

export const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  sets: z.string().min(1, "Sets is required"),
  reps: z.string().min(1, "Reps is required"),
  restPeriod: z.string().min(1, "Rest period is required"),
  equipment: z.array(z.string()).optional(),
  targetMuscles: z.array(z.string()).optional(),
  notes: z.string().optional(),
  weight: z.string().optional(),
  rpe: z.string().optional(),
});

export const workoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string() as z.ZodType<WorkoutType>,
  duration: z.string().min(1, "Duration is required"),
  difficulty: z.string().optional() as z.ZodType<WorkoutDifficulty | undefined>,
  calories: z.string().optional(),
  exercises: z.array(exerciseSchema).optional(),
  notes: z.string().optional(),
  warmupDuration: z.string().optional(),
  cooldownDuration: z.string().optional(),
  restBetweenExercises: z.string().optional(),
});

export type WorkoutFormType = z.infer<typeof workoutSchema>;

export type Exercise = z.infer<typeof exerciseSchema>;

// List of equipment options for exercises
export const equipmentList = [
  "Dumbbells",
  "Barbell",
  "Kettlebell",
  "Resistance Bands",
  "Bodyweight",
  "Machine",
  "Cable",
  "Bench",
  "Pull-up Bar",
  "Box",
  "Medicine Ball",
  "TRX",
  "Yoga Mat",
  "Foam Roller",
  "Smith Machine",
  "Battle Ropes",
  "Exercise Ball"
];

// List of muscle groups for targeting exercises
export const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Forearms",
  "Quadriceps",
  "Hamstrings",
  "Calves",
  "Glutes",
  "Abs",
  "Core",
  "Full Body",
  "Upper Body",
  "Lower Body"
];

// Template type for workout templates
export interface WorkoutTemplate {
  id: string;
  title: string;
  type: WorkoutType;
  duration: string;
  difficulty: WorkoutDifficulty;
  category: string;
  target: string;
  description?: string;
  exercises: Exercise[];
  warmupDuration?: string;
  cooldownDuration?: string;
  restBetweenExercises?: string;
  calories?: string;
  notes?: string;
  image?: string;
  // Additional properties needed for templates
  intensity?: string;
  spaceRequired?: string;
  equipment?: string[];
  targetMuscles?: string[];
  frequency?: string;
  benefits?: string[];
  tips?: string[];
  alternatives?: string[];
}
