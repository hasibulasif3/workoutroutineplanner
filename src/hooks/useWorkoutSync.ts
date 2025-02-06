import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { workoutService } from '@/services/workoutService';
import { WeeklyWorkouts, Workout } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useWorkoutSync() {
  const queryClient = useQueryClient();

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('workouts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workouts'
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['workouts'] });
          toast.info('Workout changes detected', {
            description: 'Syncing latest changes...'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const syncWorkout = useCallback(async (
    workout: Workout,
    sourceDay: string,
    targetDay: string
  ) => {
    try {
      // Generate sync hash
      const syncHash = Date.now().toString();
      
      // Prepare workout data with sync metadata
      const workoutWithMeta = {
        ...workout,
        sync_hash: syncHash,
        client_timestamp: new Date().toISOString(),
        sync_status: 'pending',
        retry_count: 0
      };

      // Optimistically update the cache
      queryClient.setQueryData(['workouts'], (old: WeeklyWorkouts | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          [sourceDay]: old[sourceDay].filter(w => w.id !== workout.id),
          [targetDay]: [...old[targetDay], workoutWithMeta]
        };
      });

      // Update the database
      await workoutService.updateWorkout(workout.id, workoutWithMeta);
      
      // Mark as synced
      queryClient.setQueryData(['workouts'], (old: WeeklyWorkouts | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          [targetDay]: old[targetDay].map(w => 
            w.id === workout.id 
              ? { ...w, sync_status: 'synced' }
              : w
          )
        };
      });

      toast.success('Workout moved successfully!');
    } catch (error) {
      console.error('Error syncing workout:', error);
      
      // Revert optimistic update
      queryClient.setQueryData(['workouts'], (old: WeeklyWorkouts | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          [sourceDay]: [...old[sourceDay], workout],
          [targetDay]: old[targetDay].filter(w => w.id !== workout.id)
        };
      });

      toast.error('Failed to move workout', {
        description: 'Please try again'
      });
    }
  };

  return { syncWorkout };
}