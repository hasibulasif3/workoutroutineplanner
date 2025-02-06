import { supabase } from "@/integrations/supabase/client";
import { Exercise, Workout, WorkoutInput, WeeklyWorkouts, WorkoutType, WorkoutDifficulty } from "@/types/workout";
import { Json } from "@/integrations/supabase/types";

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

export class WorkoutService {
  async getWorkouts(): Promise<WeeklyWorkouts> {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        return DEFAULT_WORKOUTS;
      }

      const groupedWorkouts = Object.keys(DEFAULT_WORKOUTS).reduce((acc, day) => {
        acc[day as keyof WeeklyWorkouts] = [];
        return acc;
      }, {} as WeeklyWorkouts);

      data.forEach((workout) => {
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
            exercises: (workout.exercises as unknown as Exercise[]) || [],
            last_modified: workout.last_modified
          });
        }
      });

      return groupedWorkouts;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw error;
    }
  }

  async createWorkout(workout: WorkoutInput): Promise<Workout> {
    const workoutData = {
      ...workout,
      exercises: workout.exercises || [],
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
      exercises: (data.exercises as unknown as Exercise[]) || [],
      last_modified: data.last_modified
    };
  }

  async updateWorkout(id: string, workout: Partial<Workout>): Promise<Workout> {
    const workoutData = {
      ...workout,
      exercises: workout.exercises || [],
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
      exercises: (data.exercises as unknown as Exercise[]) || [],
      last_modified: data.last_modified
    };
  }
}

export const workoutService = new WorkoutService();