import { supabase } from "@/integrations/supabase/client";
import { Workout, WeeklyWorkouts, Exercise, SyncStatus } from "@/types/workout";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

const mapWorkoutToDb = async (workout: Omit<Workout, "id">) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  return {
    title: workout.title,
    type: workout.type,
    duration: workout.duration,
    difficulty: workout.difficulty || null,
    calories: workout.calories || null,
    notes: workout.notes || null,
    completed: workout.completed || false,
    last_modified: new Date().toISOString(),
    exercises: workout.exercises as unknown as Json,
    warmup_duration: workout.warmupDuration || null,
    cooldown_duration: workout.cooldownDuration || null,
    rest_between_exercises: workout.restBetweenExercises || null,
    user_id: user?.id || null,
    sync_status: workout.syncStatus || 'synced',
    last_synced_at: workout.lastSyncedAt?.toISOString() || null,
    local_changes: workout.localChanges as unknown as Json || {},
    sync_conflicts: workout.syncConflicts as unknown as Json || [],
    scheduled_time: workout.scheduledTime?.toISOString() || null,
    time_zone: workout.timeZone || 'UTC',
    exercise_validation_rules: workout.exerciseValidationRules as unknown as Json || {},
    total_exercise_time: workout.totalExerciseTime || null,
    metadata: {
      lastSyncedAt: new Date().toISOString(),
      version: "1.0",
    } as Json,
  };
};

const mapDbToWorkout = (dbWorkout: any): Workout => ({
  id: dbWorkout.id,
  title: dbWorkout.title,
  type: dbWorkout.type,
  duration: dbWorkout.duration,
  difficulty: dbWorkout.difficulty,
  calories: dbWorkout.calories,
  notes: dbWorkout.notes,
  completed: dbWorkout.completed || false,
  lastModified: new Date(dbWorkout.last_modified),
  exercises: (dbWorkout.exercises as Exercise[]) || [],
  warmupDuration: dbWorkout.warmup_duration,
  cooldownDuration: dbWorkout.cooldown_duration,
  restBetweenExercises: dbWorkout.rest_between_exercises,
  metadata: dbWorkout.metadata,
  userId: dbWorkout.user_id,
  syncStatus: dbWorkout.sync_status as SyncStatus,
  lastSyncedAt: dbWorkout.last_synced_at ? new Date(dbWorkout.last_synced_at) : undefined,
  localChanges: dbWorkout.local_changes || {},
  syncConflicts: dbWorkout.sync_conflicts || [],
  scheduledTime: dbWorkout.scheduled_time ? new Date(dbWorkout.scheduled_time) : undefined,
  timeZone: dbWorkout.time_zone || 'UTC',
  exerciseValidationRules: dbWorkout.exercise_validation_rules || {},
  totalExerciseTime: dbWorkout.total_exercise_time,
});

export const workoutService = {
  async createWorkout(workout: Omit<Workout, "id">): Promise<Workout | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      const mappedWorkout = await mapWorkoutToDb(workout);
      const { data, error } = await supabase
        .from("workouts")
        .insert([mappedWorkout])
        .select()
        .single();

      if (error) throw error;
      return data ? mapDbToWorkout(data) : null;
    } catch (error: any) {
      console.error("Error creating workout:", error);
      if (error.message === "User not authenticated") {
        toast.error("Please sign in to create workouts");
      } else if (error.code === "23505") {
        toast.error("A workout with this name already exists");
      } else if (error.code === "PGRST116") {
        toast.error("Invalid data format");
      } else {
        toast.error("Failed to create workout. Please try again.");
      }
      return null;
    }
  },

  async updateWorkout(workout: Workout): Promise<Workout | null> {
    try {
      const mappedWorkout = await mapWorkoutToDb(workout);
      const { data, error } = await supabase
        .from("workouts")
        .update(mappedWorkout)
        .eq("id", workout.id)
        .select()
        .single();

      if (error) throw error;
      return data ? mapDbToWorkout(data) : null;
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

      const convertedWorkouts = data.map(mapDbToWorkout);

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
        // Assign workouts to days based on scheduledTime if available
        if (workout.scheduledTime) {
          const day = new Date(workout.scheduledTime)
            .toLocaleDateString('en-US', { weekday: 'long' });
          weeklyWorkouts[day].push(workout);
        } else {
          weeklyWorkouts.Monday.push(workout);
        }
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
        async (payload) => {
          try {
            const workouts = await this.fetchWorkouts();
            callback(workouts);
            
            if (payload.eventType === 'UPDATE') {
              const newWorkout = payload.new;
              if (newWorkout.sync_conflicts && 
                  (newWorkout.sync_conflicts as any[]).length > 0) {
                toast.warning("Sync conflict detected. Please review changes.");
              }
            }
          } catch (error) {
            console.error("Error in subscription:", error);
            toast.error("Failed to sync workout changes");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};