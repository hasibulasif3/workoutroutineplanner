import { supabase } from "@/integrations/supabase/client";
import { WorkoutValidationType } from "@/utils/validation";
import { toast } from "sonner";

export const workoutService = {
  async createWorkout(workout: WorkoutValidationType) {
    try {
      const { data, error } = await supabase
        .from("workouts")
        .insert([workout])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      toast.error("Failed to create workout");
      throw error;
    }
  },

  async updateWorkout(id: string, workout: Partial<WorkoutValidationType>) {
    try {
      const { data, error } = await supabase
        .from("workouts")
        .update(workout)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      toast.error("Failed to update workout");
      throw error;
    }
  },

  async deleteWorkout(id: string) {
    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      toast.error("Failed to delete workout");
      throw error;
    }
  },

  async getWorkouts() {
    try {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      toast.error("Failed to fetch workouts");
      throw error;
    }
  },
};