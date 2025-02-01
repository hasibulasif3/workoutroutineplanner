import { supabase } from "@/integrations/supabase/client";
import { WeeklyWorkouts, Workout } from "@/types/workout";
import { toast } from "sonner";

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
    
    // Load offline queue from localStorage
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

      // Group workouts by day
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
      const { data, error } = await this.retryOperation(async () =>
        await supabase
          .from('workouts')
          .insert([workout])
          .select()
          .single()
      );

      if (error) throw error;
      toast.success('Workout created successfully!');
      return data;
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
      const { data, error } = await this.retryOperation(async () =>
        await supabase
          .from('workouts')
          .update(workout)
          .eq('id', workout.id)
          .select()
          .single()
      );

      if (error) throw error;
      return data;
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
}

export const workoutService = new WorkoutService();