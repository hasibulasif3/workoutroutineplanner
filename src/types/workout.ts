export type WorkoutDifficulty = "beginner" | "intermediate" | "advanced";
export type WorkoutType = "strength" | "cardio" | "flexibility";

export interface Workout {
  id: string;
  title: string;
  duration: string;
  type: WorkoutType;
  difficulty?: WorkoutDifficulty;
  calories?: string;
  notes?: string;
  completed?: boolean;
  lastModified: Date;
}

export type WeeklyWorkouts = {
  [key: string]: Workout[];
};