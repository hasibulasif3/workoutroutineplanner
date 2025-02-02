import { supabase } from "@/integrations/supabase/client";
import { Exercise, Workout, WorkoutInput, WeeklyWorkouts, WorkoutType, WorkoutDifficulty } from "@/types/workout";

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

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

      const groupedWorkouts = DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = [];
        return acc;
      }, {} as WeeklyWorkouts);

      data.forEach((workout) => {
        const day = new Date(workout.scheduled_time || workout.created_at)
          .toLocaleString('en-US', { weekday: 'long' }) as keyof WeeklyWorkouts;
        
        if (groupedWorkouts[day]) {
          groupedWorkouts[day].push({
            ...workout,
            exercises: workout.exercises as Exercise[] || [],
            type: workout.type as WorkoutType,
            difficulty: workout.difficulty as WorkoutDifficulty
          });
        }
      });

      return groupedWorkouts;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      return DEFAULT_WORKOUTS;
    }
  }

  async createWorkout(workout: WorkoutInput): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .insert([{
        ...workout,
        exercises: workout.exercises || [],
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      exercises: data.exercises as Exercise[],
      type: data.type as WorkoutType,
      difficulty: data.difficulty as WorkoutDifficulty
    };
  }

  async updateWorkout(id: string, workout: Partial<WorkoutInput>): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .update({
        ...workout,
        last_modified: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      exercises: data.exercises as Exercise[],
      type: data.type as WorkoutType,
      difficulty: data.difficulty as WorkoutDifficulty
    };
  }

  async deleteWorkout(id: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const workoutService = new WorkoutService();