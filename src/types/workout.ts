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
  completed?: boolean;
  exercises: Exercise[];
  warmup_duration?: string;
  cooldown_duration?: string;
  rest_between_exercises?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  syncStatus?: SyncStatus;
  last_synced_at?: Date;
  local_changes?: Record<string, unknown>;
  sync_conflicts?: Array<{
    timestamp: Date;
    oldValue: Workout;
    newValue: Workout;
  }>;
  scheduled_time?: Date;
  timeZone?: string;
  exercise_validation_rules?: Record<string, unknown>;
  total_exercise_time?: number;
  created_at?: string;
  last_modified?: string;
  display_order?: number;
  concurrent_version?: number;
  exercise_order?: unknown[];
  offline_id?: string;
  related_workouts?: unknown[];
}

export type WeeklyWorkouts = {
  [key: string]: Workout[];
};