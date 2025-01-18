import { supabase } from "@/integrations/supabase/client";
import { Workout, WeeklyWorkouts } from "@/types/workout";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

// Type for the database workout shape
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

// Type for inserting a workout into the database
type DbWorkoutInsert = Omit<DbWorkout, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

// Convert database workout to frontend workout
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

// Convert frontend workout to database format
const mapWorkoutToDb = (workout: Omit<Workout, "id">): DbWorkoutInsert => ({
  title: workout.title,
  type: workout.type,
  duration: workout.duration,
  difficulty: workout.difficulty || null,
  calories: workout.calories || null,
  notes: workout.notes || null,
  completed: workout.completed || false,
  last_modified: workout.lastModified.toISOString(),
  user_id: null, // Will be set by RLS policy
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

      // Convert all workouts to frontend format
      const convertedWorkouts = data.map(mapDbWorkoutToWorkout);

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

      // For now, assign to Monday by default
      // TODO: Add day field to workout table
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