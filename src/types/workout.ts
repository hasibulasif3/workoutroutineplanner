
export type WorkoutDifficulty = "beginner" | "intermediate" | "advanced";
export type WorkoutType = "strength" | "cardio" | "flexibility";
export type SyncStatus = "synced" | "pending" | "conflict" | "error";

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  restPeriod: string;
  equipment?: string[];
  targetMuscles?: string[];
  notes?: string;
  weight?: string;
  rpe?: string;
}

export interface Workout {
  id: string;
  title: string;
  duration: string;
  type: WorkoutType;
  difficulty?: WorkoutDifficulty;
  calories?: string;
  notes?: string;
  exercises: Exercise[];
  last_modified: string;
}

export interface WorkoutInput {
  title: string;
  duration: string;
  type: WorkoutType;
  difficulty?: WorkoutDifficulty;
  calories?: string;
  notes?: string;
  exercises: Exercise[];
}

export type WeeklyWorkouts = {
  [key in 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday']: Workout[];
};

// Helper type for database operations
export type WorkoutDB = Omit<Workout, 'exercises'> & {
  exercises: Json;
  user_id?: string;
  sync_status?: SyncStatus;
  last_synced_at?: string;
};

// JSON type for database operations
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
