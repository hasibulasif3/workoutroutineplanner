import { supabase } from "@/integrations/supabase/client";
import { WeeklyWorkouts, Workout, WorkoutInput } from "@/types/workout";
import { toast } from "sonner";

class WorkoutService {
  async fetchWorkouts(): Promise<WeeklyWorkouts> {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const groupedWorkouts: WeeklyWorkouts = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      };

      data.forEach((workout) => {
        const day = workout.scheduled_time 
          ? new Date(workout.scheduled_time).toLocaleString('en-US', { weekday: 'long' })
          : 'Monday';
        
        if (day in groupedWorkouts) {
          groupedWorkouts[day as keyof WeeklyWorkouts].push(this.parseWorkoutData(workout));
        }
      });

      return groupedWorkouts;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast.error('Failed to fetch workouts');
      throw error;
    }
  }

  async createWorkout(workout: WorkoutInput): Promise<Workout> {
    try {
      const workoutData = {
        title: workout.title,
        duration: workout.duration,
        type: workout.type,
        difficulty: workout.difficulty,
        calories: workout.calories,
        notes: workout.notes,
        exercises: workout.exercises ? JSON.stringify(workout.exercises) : '[]',
        user_id: (await supabase.auth.getUser()).data.user?.id,
      };

      const { data, error } = await supabase
        .from('workouts')
        .insert([workoutData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Workout created successfully!');
      return this.parseWorkoutData(data);
    } catch (error) {
      console.error('Error creating workout:', error);
      toast.error('Failed to create workout');
      throw error;
    }
  }

  async updateWorkout(id: string, workout: Partial<WorkoutInput>): Promise<Workout> {
    try {
      const workoutData = {
        ...workout,
        exercises: workout.exercises ? JSON.stringify(workout.exercises) : undefined,
      };

      const { data, error } = await supabase
        .from('workouts')
        .update(workoutData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.parseWorkoutData(data);
    } catch (error) {
      console.error('Error updating workout:', error);
      toast.error('Failed to update workout');
      throw error;
    }
  }

  async deleteWorkout(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Workout deleted successfully!');
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
      throw error;
    }
  }

  subscribeToWorkouts(callback: (workouts: WeeklyWorkouts) => void) {
    const channel = supabase
      .channel('workout-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workouts'
        },
        async () => {
          const workouts = await this.fetchWorkouts();
          callback(workouts);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  private parseWorkoutData(data: any): Workout {
    return {
      ...data,
      exercises: JSON.parse(data.exercises || '[]'),
      type: data.type as WorkoutType,
      difficulty: data.difficulty as WorkoutDifficulty,
    };
  }
}

export const workoutService = new WorkoutService();