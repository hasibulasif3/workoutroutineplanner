import { supabase } from "@/integrations/supabase/client";
import { Exercise, Workout, WorkoutInput, WeeklyWorkouts } from "@/types/workout";

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
  private subscribers: ((workouts: WeeklyWorkouts) => void)[] = [];

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
            exercises: (workout.exercises as unknown as Exercise[]) || [],
            type: workout.type,
            difficulty: workout.difficulty
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
        exercises: JSON.stringify(workout.exercises || []),
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      exercises: JSON.parse(data.exercises as string) as Exercise[],
      type: data.type,
      difficulty: data.difficulty
    };
  }

  async updateWorkout(id: string, workout: Partial<WorkoutInput>): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .update({
        ...workout,
        exercises: workout.exercises ? JSON.stringify(workout.exercises) : undefined,
        last_modified: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      exercises: JSON.parse(data.exercises as string) as Exercise[],
      type: data.type,
      difficulty: data.difficulty
    };
  }

  async deleteWorkout(id: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  subscribeToWorkouts(callback: (workouts: WeeklyWorkouts) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(workouts: WeeklyWorkouts) {
    this.subscribers.forEach(callback => callback(workouts));
  }
}

export const workoutService = new WorkoutService();