import { supabase } from "@/integrations/supabase/client";
import { Workout, WorkoutInput, WeeklyWorkouts } from "@/types/workout";
import { toast } from "sonner";

class WorkoutService {
  async getWorkouts(): Promise<WeeklyWorkouts> {
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

      data.forEach((workout: Workout) => {
        const day = workout.scheduled_time 
          ? new Date(workout.scheduled_time).toLocaleString('en-US', { weekday: 'long' })
          : 'Monday';
        
        if (groupedWorkouts[day]) {
          groupedWorkouts[day].push(workout);
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
      const { data, error } = await supabase
        .from('workouts')
        .insert([{
          ...workout,
          exercises: JSON.stringify(workout.exercises || []),
          created_at: new Date().toISOString(),
          last_modified: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating workout:', error);
      toast.error('Failed to create workout');
      throw error;
    }
  }

  async updateWorkout(id: string, workout: Partial<WorkoutInput>): Promise<Workout> {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .update({
          ...workout,
          exercises: workout.exercises ? JSON.stringify(workout.exercises) : undefined,
          last_modified: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
          const workouts = await this.getWorkouts();
          callback(workouts);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const workoutService = new WorkoutService();