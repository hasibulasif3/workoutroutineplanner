import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyWorkouts, Workout } from '@/types/workout';
import { storageService } from '@/services/storageService';

export function useWorkoutSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  // Subscribe to real-time updates
  useEffect(() => {
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
          console.log('Received real-time update:', payload);
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: ['workouts'] });
          
          // Update local storage
          const currentWorkouts = queryClient.getQueryData<WeeklyWorkouts>(['workouts']);
          if (currentWorkouts) {
            storageService.saveWorkouts(currentWorkouts);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const syncWorkout = async (workout: Workout, day: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('workouts')
        .upsert({
          id: workout.id,
          title: workout.title,
          type: workout.type,
          duration: workout.duration,
          difficulty: workout.difficulty,
          calories: workout.calories,
          notes: workout.notes,
          completed: workout.completed,
          last_modified: new Date().toISOString(),
          version: '1.0',
          metadata: { day }
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistically update the cache
      queryClient.setQueryData<WeeklyWorkouts>(['workouts'], (old) => {
        if (!old) return old;
        return {
          ...old,
          [day]: old[day].map((w) => (w.id === workout.id ? workout : w))
        };
      });

      toast.success('Workout synced successfully');
      return data;
    } catch (err) {
      console.error('Error syncing workout:', err);
      setError(err as Error);
      toast.error('Failed to sync workout. Retrying...');
      
      // Implement retry mechanism
      return new Promise((resolve) => {
        setTimeout(() => {
          syncWorkout(workout, day).then(resolve);
        }, 3000);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncWorkouts = async (workouts: WeeklyWorkouts) => {
    setIsLoading(true);
    setError(null);

    try {
      const promises = Object.entries(workouts).flatMap(([day, dayWorkouts]) =>
        dayWorkouts.map((workout) => syncWorkout(workout, day))
      );

      await Promise.all(promises);
      toast.success('All workouts synced successfully');
    } catch (err) {
      console.error('Error syncing workouts:', err);
      setError(err as Error);
      toast.error('Failed to sync all workouts');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    syncWorkout,
    syncWorkouts
  };
}