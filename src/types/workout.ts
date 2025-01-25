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
  lastModified: Date;
  exercises: Exercise[];
  warmupDuration?: string;
  cooldownDuration?: string;
  restBetweenExercises?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  syncStatus?: SyncStatus;
  lastSyncedAt?: Date;
  localChanges?: Record<string, unknown>;
  syncConflicts?: Array<{
    timestamp: Date;
    oldValue: Workout;
    newValue: Workout;
  }>;
  scheduledTime?: Date;
  timeZone?: string;
  exerciseValidationRules?: Record<string, unknown>;
  totalExerciseTime?: number;
}

export type WeeklyWorkouts = {
  [key: string]: Workout[];
};