import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { workoutService } from '@/services/workoutService';
import { WeeklyWorkouts } from '@/types/workout';

export function useWorkoutSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = workoutService.subscribeToWorkouts((workouts) => {
      queryClient.setQueryData(['workouts'], workouts);
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  const syncWorkouts = async (workouts: WeeklyWorkouts) => {
    try {
      // Update cache
      queryClient.setQueryData(['workouts'], workouts);
      
      // Update database
      const promises = Object.values(workouts)
        .flat()
        .map(workout => workoutService.updateWorkout(workout.id, workout));
      
      await Promise.all(promises);
      
      // Refresh cache
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    } catch (error) {
      console.error('Error syncing workouts:', error);
    }
  };

  return { syncWorkouts };
}