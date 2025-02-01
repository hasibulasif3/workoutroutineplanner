import { supabase } from "@/integrations/supabase/client";
import { WeeklyWorkouts, Workout } from "@/types/workout";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

class WorkoutService {
  private offlineQueue: Array<{
    type: 'create' | 'update' | 'delete';
    data: any;
    timestamp: number;
  }> = [];
  private isOnline = navigator.onLine;
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    const savedQueue = localStorage.getItem('workoutOfflineQueue');
    if (savedQueue) {
      this.offlineQueue = JSON.parse(savedQueue);
    }
  }

  private handleOnline = async () => {
    this.isOnline = true;
    toast.success('Back online! Syncing changes...');
    await this.processOfflineQueue();
  };

  private handleOffline = () => {
    this.isOnline = false;
    toast.warning('You are offline. Changes will be synced when connection is restored.');
  };

  private async processOfflineQueue() {
    while (this.offlineQueue.length > 0) {
      const item = this.offlineQueue[0];
      try {
        switch (item.type) {
          case 'create':
            await this.createWorkout(item.data, true);
            break;
          case 'update':
            await this.updateWorkout(item.data, true);
            break;
          case 'delete':
            await this.deleteWorkout(item.data, true);
            break;
        }
        this.offlineQueue.shift();
        localStorage.setItem('workoutOfflineQueue', JSON.stringify(this.offlineQueue));
      } catch (error) {
        console.error('Error processing offline queue:', error);
        break;
      }
    }
  }

  private async retryOperation(operation: () => Promise<any>) {
    let attempts = 0;
    while (attempts < this.retryAttempts) {
      try {
        return await operation();
      } catch (error) {
        attempts++;
        if (attempts === this.retryAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempts));
      }
    }
  }

  async fetchWorkouts(): Promise<WeeklyWorkouts> {
    try {
      const { data, error } = await this.retryOperation(async () => 
        await supabase
          .from('workouts')
          .select('*')
          .order('created_at', { ascending: true })
      );

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
      toast.error('Failed to fetch workouts. Retrying...');
      throw error;
    }
  }

  async createWorkout(workout: Partial<Workout>, bypassQueue = false): Promise<Workout | null> {
    if (!this.isOnline && !bypassQueue) {
      this.offlineQueue.push({
        type: 'create',
        data: workout,
        timestamp: Date.now()
      });
      localStorage.setItem('workoutOfflineQueue', JSON.stringify(this.offlineQueue));
      toast.info('Workout will be created when you\'re back online');
      return null;
    }

    try {
      const workoutData = {
        duration: workout.duration || '0',
        title: workout.title || 'Untitled Workout',
        type: workout.type || 'cardio',
        exercises: Array.isArray(workout.exercises) 
          ? JSON.stringify(workout.exercises) 
          : '[]',
        metadata: typeof workout.metadata === 'object' 
          ? JSON.stringify(workout.metadata || {}) 
          : '{}',
        exercise_order: Array.isArray(workout.exercise_order) 
          ? JSON.stringify(workout.exercise_order || []) 
          : '[]',
        related_workouts: Array.isArray(workout.related_workouts) 
          ? JSON.stringify(workout.related_workouts || []) 
          : '[]',
        local_changes: typeof workout.local_changes === 'object' 
          ? JSON.stringify(workout.local_changes || {}) 
          : '{}',
        sync_conflicts: Array.isArray(workout.sync_conflicts) 
          ? JSON.stringify(workout.sync_conflicts || []) 
          : '[]',
        exercise_validation_rules: typeof workout.exercise_validation_rules === 'object' 
          ? JSON.stringify(workout.exercise_validation_rules || {}) 
          : '{}',
        calories: workout.calories,
        completed: workout.completed,
        difficulty: workout.difficulty,
        notes: workout.notes,
        warmup_duration: workout.warmup_duration,
        cooldown_duration: workout.cooldown_duration,
        rest_between_exercises: workout.rest_between_exercises,
        scheduled_time: workout.scheduled_time ? new Date(workout.scheduled_time).toISOString() : null,
        time_zone: workout.timeZone || 'UTC',
        display_order: workout.display_order,
        concurrent_version: workout.concurrent_version || 1,
        sync_status: workout.syncStatus || 'synced',
      };

      const { data, error } = await this.retryOperation(async () =>
        await supabase
          .from('workouts')
          .insert([workoutData])
          .select()
          .single()
      );

      if (error) throw error;
      toast.success('Workout created successfully!');
      return this.parseWorkoutData(data);
    } catch (error) {
      console.error('Error creating workout:', error);
      toast.error('Failed to create workout');
      throw error;
    }
  }

  async updateWorkout(workout: Partial<Workout>, bypassQueue = false): Promise<Workout | null> {
    if (!this.isOnline && !bypassQueue) {
      this.offlineQueue.push({
        type: 'update',
        data: workout,
        timestamp: Date.now()
      });
      localStorage.setItem('workoutOfflineQueue', JSON.stringify(this.offlineQueue));
      toast.info('Workout will be updated when you\'re back online');
      return null;
    }

    try {
      const workoutData = {
        ...workout,
        exercises: Array.isArray(workout.exercises) 
          ? JSON.stringify(workout.exercises) 
          : undefined,
        metadata: typeof workout.metadata === 'object' 
          ? JSON.stringify(workout.metadata) 
          : undefined,
        exercise_order: Array.isArray(workout.exercise_order) 
          ? JSON.stringify(workout.exercise_order) 
          : undefined,
        related_workouts: Array.isArray(workout.related_workouts) 
          ? JSON.stringify(workout.related_workouts) 
          : undefined,
        local_changes: typeof workout.local_changes === 'object' 
          ? JSON.stringify(workout.local_changes) 
          : undefined,
        sync_conflicts: Array.isArray(workout.sync_conflicts) 
          ? JSON.stringify(workout.sync_conflicts) 
          : undefined,
        exercise_validation_rules: typeof workout.exercise_validation_rules === 'object' 
          ? JSON.stringify(workout.exercise_validation_rules) 
          : undefined,
        scheduled_time: workout.scheduled_time ? new Date(workout.scheduled_time).toISOString() : null,
        last_synced_at: workout.last_synced_at ? new Date(workout.last_synced_at).toISOString() : null,
      };

      const { data, error } = await this.retryOperation(async () =>
        await supabase
          .from('workouts')
          .update(workoutData)
          .eq('id', workout.id)
          .select()
          .single()
      );

      if (error) throw error;
      return this.parseWorkoutData(data);
    } catch (error) {
      console.error('Error updating workout:', error);
      toast.error('Failed to update workout');
      throw error;
    }
  }

  async deleteWorkout(workoutId: string, bypassQueue = false): Promise<void> {
    if (!this.isOnline && !bypassQueue) {
      this.offlineQueue.push({
        type: 'delete',
        data: workoutId,
        timestamp: Date.now()
      });
      localStorage.setItem('workoutOfflineQueue', JSON.stringify(this.offlineQueue));
      toast.info('Workout will be deleted when you\'re back online');
      return;
    }

    try {
      const { error } = await this.retryOperation(async () =>
        await supabase
          .from('workouts')
          .delete()
          .eq('id', workoutId)
      );

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
      metadata: JSON.parse(data.metadata || '{}'),
      exercise_order: JSON.parse(data.exercise_order || '[]'),
      related_workouts: JSON.parse(data.related_workouts || '[]'),
      local_changes: JSON.parse(data.local_changes || '{}'),
      sync_conflicts: JSON.parse(data.sync_conflicts || '[]'),
      exercise_validation_rules: JSON.parse(data.exercise_validation_rules || '{}'),
    };
  }
}

export const workoutService = new WorkoutService();