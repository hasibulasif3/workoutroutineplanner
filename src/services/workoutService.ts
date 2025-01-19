import { supabase } from "@/integrations/supabase/client";
import { Workout, WeeklyWorkouts } from "@/types/workout";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

type DbWorkout = {
  id: string;
  user_id: string | null;
  title: string;
  type: string;
  duration: string;
  difficulty: string | null;
  calories: string | null;
  notes: string | null;
  completed: boolean | null;
  created_at: string | null;
  last_modified: string | null;
  exercises: Json | null;
  warmup_duration: string | null;
  cooldown_duration: string | null;
  rest_between_exercises: string | null;
  version: string | null;
  metadata: Json | null;
};

const mapDbWorkoutToWorkout = (dbWorkout: DbWorkout): Workout => ({
  id: dbWorkout.id,
  title: dbWorkout.title,
  type: dbWorkout.type as Workout['type'],
  duration: dbWorkout.duration,
  difficulty: dbWorkout.difficulty as Workout['difficulty'],
  calories: dbWorkout.calories || undefined,
  notes: dbWorkout.notes || undefined,
  completed: dbWorkout.completed || false,
  lastModified: dbWorkout.last_modified ? new Date(dbWorkout.last_modified) : new Date(),
});

const mapWorkoutToDb = (workout: Omit<Workout, "id">): Omit<DbWorkout, "id" | "created_at"> => ({
  title: workout.title,
  type: workout.type,
  duration: workout.duration,
  difficulty: workout.difficulty || null,
  calories: workout.calories || null,
  notes: workout.notes || null,
  completed: workout.completed || false,
  last_modified: new Date().toISOString(),
  user_id: null,
  exercises: null,
  warmup_duration: null,
  cooldown_duration: null,
  rest_between_exercises: null,
  version: '1.0',
  metadata: {}
});

export const workoutService = {
  async createWorkout(workout: Omit<Workout, "id">): Promise<Workout | null> {
    try {
      const { data, error } = await supabase
        .from("workouts")
        .insert([mapWorkoutToDb(workout)])
        .select()
        .single();

      if (error) throw error;
      return data ? mapDbWorkoutToWorkout(data) : null;
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
        .update(mapWorkoutToDb(workout))
        .eq("id", workout.id)
        .select()
        .single();

      if (error) throw error;
      return data ? mapDbWorkoutToWorkout(data) : null;
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

  async fetchWorkouts(): Promise<WeeklyWorkouts> {
    try {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const convertedWorkouts = data.map(mapDbWorkoutToWorkout);

      const weeklyWorkouts: WeeklyWorkouts = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      };

      convertedWorkouts.forEach((workout) => {
        weeklyWorkouts.Monday.push(workout);
      });

      return weeklyWorkouts;
    } catch (error) {
      console.error("Error fetching workouts:", error);
      toast.error("Failed to fetch workouts");
      return {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      };
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
          callback(workouts);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};