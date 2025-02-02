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
            exercises: workout.exercises ? JSON.parse(workout.exercises as string) : [],
            last_modified: workout.last_modified
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
      id: data.id,
      title: data.title,
      duration: data.duration,
      type: data.type as WorkoutType,
      difficulty: data.difficulty as WorkoutDifficulty,
      calories: data.calories,
      notes: data.notes,
      exercises: data.exercises ? JSON.parse(data.exercises as string) : [],
      last_modified: data.last_modified
    };
  }

  async updateWorkout(id: string, workout: Partial<WorkoutInput>): Promise<Workout> {
    const updateData = {
      ...workout,
      exercises: workout.exercises ? JSON.stringify(workout.exercises) : undefined,
      last_modified: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('workouts')
      .update(updateData)
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
      exercises: data.exercises ? JSON.parse(data.exercises as string) : [],
      last_modified: data.last_modified
    };
  }

  subscribeToWorkouts(callback: (workouts: WeeklyWorkouts) => void): () => void {
    this.subscribers.push(callback);
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('workouts_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'workouts' 
      }, async () => {
        const workouts = await this.getWorkouts();
        this.notifySubscribers(workouts);
      })
      .subscribe();

    // Return cleanup function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
      subscription.unsubscribe();
    };
  }

  private notifySubscribers(workouts: WeeklyWorkouts) {
    this.subscribers.forEach(callback => callback(workouts));
  }
}

export const workoutService = new WorkoutService();