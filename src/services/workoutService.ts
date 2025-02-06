import { supabase } from "@/integrations/supabase/client";
import { Exercise, Workout, WorkoutInput, WeeklyWorkouts, WorkoutType, WorkoutDifficulty } from "@/types/workout";

const DEFAULT_WORKOUTS: WeeklyWorkouts = {
  Monday: [
    {
      id: "1",
      title: "Morning Run",
      duration: "30",
      type: "cardio",
      difficulty: "beginner",
      calories: "300",
      exercises: [],
      last_modified: new Date().toISOString()
    }
  ],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: []
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export class WorkoutService {
  private async retryOperation<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.retryOperation(operation, retries - 1);
      }
      throw error;
    }
  }

  async getWorkouts(): Promise<WeeklyWorkouts> {
    return this.retryOperation(async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const groupedWorkouts = Object.keys(DEFAULT_WORKOUTS).reduce((acc, day) => {
        acc[day as keyof WeeklyWorkouts] = [];
        return acc;
      }, {} as WeeklyWorkouts);

      data?.forEach((workout) => {
        const day = new Date(workout.scheduled_time || workout.created_at)
          .toLocaleString('en-US', { weekday: 'long' }) as keyof WeeklyWorkouts;
        
        if (groupedWorkouts[day]) {
          groupedWorkouts[day].push({
            id: workout.id,
            title: workout.title,
            duration: workout.duration,
            type: workout.type as WorkoutType,
            difficulty: workout.difficulty as WorkoutDifficulty,
            calories: workout.calories,
            notes: workout.notes,
            exercises: workout.exercises || [],
            last_modified: workout.last_modified
          });
        }
      });

      return groupedWorkouts;
    });
  }

  async createWorkout(workout: WorkoutInput): Promise<Workout> {
    const workoutData = {
      ...workout,
      exercises: JSON.stringify(workout.exercises || []),
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      sync_status: 'synced',
      sync_hash: Date.now().toString()
    };

    const { data, error } = await supabase
      .from('workouts')
      .insert([workoutData])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      duration: data.duration,
      type: data.type as WorkoutType,
      difficulty: data.difficulty as WorkoutDifficulty,
      calories: data.calories,
      notes: data.notes,
      exercises: (JSON.parse(data.exercises as string) as Exercise[]) || [],
      last_modified: data.last_modified
    };
  }

  async updateWorkout(id: string, workout: Partial<Workout>): Promise<Workout> {
    const workoutData = {
      ...workout,
      exercises: workout.exercises ? JSON.stringify(workout.exercises) : undefined,
      last_modified: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('workouts')
      .update(workoutData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      duration: data.duration,
      type: data.type as WorkoutType,
      difficulty: data.difficulty as WorkoutDifficulty,
      calories: data.calories,
      notes: data.notes,
      exercises: (JSON.parse(data.exercises as string) as Exercise[]) || [],
      last_modified: data.last_modified
    };
  }
}

export const workoutService = new WorkoutService();
