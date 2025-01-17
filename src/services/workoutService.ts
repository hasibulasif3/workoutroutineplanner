import { supabase } from "@/integrations/supabase/client";
import { Workout, WeeklyWorkouts } from "@/types/workout";
import { toast } from "sonner";

export const workoutService = {
  async createWorkout(workout: Omit<Workout, "id">): Promise<Workout | null> {
    try {
      const { data, error } = await supabase
        .from("workouts")
        .insert([{ ...workout, user_id: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating workout:", error);
      toast.error("Failed to create workout");
      return null;
    }
  },

  async updateWorkout(workout: Workout): Promise<Workout | null> {
    try {
      const { data, error } = await supabase
        .from("workouts")
        .update(workout)
        .eq("id", workout.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating workout:", error);
      toast.error("Failed to update workout");
      return null;
    }
  },

  async deleteWorkout(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast.error("Failed to delete workout");
      return false;
    }
  },

  async fetchWorkouts(): Promise<WeeklyWorkouts | null> {
    try {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group workouts by day
      const weeklyWorkouts: WeeklyWorkouts = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      };

      data.forEach((workout) => {
        // For now, assign to Monday by default
        // TODO: Add day field to workout table
        weeklyWorkouts.Monday.push(workout);
      });

      return weeklyWorkouts;
    } catch (error) {
      console.error("Error fetching workouts:", error);
      toast.error("Failed to fetch workouts");
      return null;
    }
  },

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
          if (workouts) {
            callback(workouts);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};