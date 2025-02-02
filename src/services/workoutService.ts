import { supabase } from "@/integrations/supabase/client";
import { Workout, WorkoutInput, WeeklyWorkouts, WorkoutType, WorkoutDifficulty } from "@/types/workout";
import { toast } from "sonner";

const initialWorkouts: WeeklyWorkouts = {
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
    },
    {
      id: "2",
      title: "Push-ups",
      duration: "15",
      type: "strength",
      difficulty: "intermediate",
      calories: "150",
      exercises: [],
      last_modified: new Date().toISOString()
    }
  ],
  Tuesday: [
    {
      id: "3",
      title: "Yoga",
      duration: "45",
      type: "flexibility",
      difficulty: "beginner",
      calories: "200",
      exercises: [],
      last_modified: new Date().toISOString()
    }
  ],
  Wednesday: [
    {
      id: "4",
      title: "HIIT",
      duration: "25",
      type: "cardio",
      difficulty: "advanced",
      calories: "400",
      exercises: [],
      last_modified: new Date().toISOString()
    }
  ],
  Thursday: [
    {
      id: "5",
      title: "Swimming",
      duration: "40",
      type: "cardio",
      difficulty: "intermediate",
      calories: "450",
      exercises: [],
      last_modified: new Date().toISOString()
    }
  ],
  Friday: [
    {
      id: "6",
      title: "Weight Training",
      duration: "50",
      type: "strength",
      difficulty: "advanced",
      calories: "500",
      exercises: [],
      last_modified: new Date().toISOString()
    }
  ],
  Saturday: [],
  Sunday: []
};

class WorkoutService {
  async getWorkouts(): Promise<WeeklyWorkouts> {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        // If no data exists, return initial workouts
        return initialWorkouts;
      }

      const groupedWorkouts: WeeklyWorkouts = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
      };

      data.forEach((workout) => {
        const day = workout.scheduled_time 
          ? new Date(workout.scheduled_time).toLocaleString('en-US', { weekday: 'long' })
          : 'Monday';
        
        if (groupedWorkouts[day]) {
          groupedWorkouts[day].push({
            ...workout,
            type: workout.type as WorkoutType,
            difficulty: workout.difficulty as WorkoutDifficulty,
            exercises: workout.exercises || []
          });
        }
      });

      return groupedWorkouts;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast.error('Failed to fetch workouts');
      return initialWorkouts; // Fallback to initial workouts on error
    }
  }

  async createWorkout(workout: WorkoutInput): Promise<Workout> {
    try {
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
        type: data.type as WorkoutType,
        difficulty: data.difficulty as WorkoutDifficulty,
        exercises: data.exercises || []
      };
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
          last_modified: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        type: data.type as WorkoutType,
        difficulty: data.difficulty as WorkoutDifficulty,
        exercises: data.exercises || []
      };
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

  subscribeToWorkouts(callback: (workouts: WeeklyWorkouts) => void): () => void {
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