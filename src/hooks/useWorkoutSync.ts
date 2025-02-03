import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { workoutService } from '@/services/workoutService';
import { WeeklyWorkouts } from '@/types/workout';

export function useWorkoutSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initial load from local storage
    const savedWorkouts = localStorage.getItem('workouts');
    if (savedWorkouts) {
      const parsedWorkouts = JSON.parse(savedWorkouts);
      queryClient.setQueryData(['workouts'], parsedWorkouts);
    }

    // Subscribe to real-time updates
    const unsubscribe = workoutService.subscribeToWorkouts((workouts) => {
      // Update both cache and local storage
      queryClient.setQueryData(['workouts'], workouts);
      localStorage.setItem('workouts', JSON.stringify(workouts));
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  const syncWorkouts = async (workouts: WeeklyWorkouts) => {
    try {
      // Update local storage
      localStorage.setItem('workouts', JSON.stringify(workouts));
      
      // Update database
      const promises = Object.values(workouts)
        .flat()
        .map(workout => workoutService.updateWorkout(workout));
      
      await Promise.all(promises);
      
      // Refresh cache
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    } catch (error) {
      console.error('Error syncing workouts:', error);
    }
  };

  return { syncWorkouts };
}