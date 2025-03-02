
import { WeeklyWorkouts } from "@/types/workout";

export const storageService = {
  saveWorkouts: (workouts: WeeklyWorkouts) => {
    try {
      console.log('Attempting to save workouts to localStorage:', workouts);
      // Convert last_modified to lastModified for storage consistency
      const processedWorkouts = Object.entries(workouts).reduce((acc, [day, dayWorkouts]) => {
        acc[day] = dayWorkouts.map(workout => ({
          ...workout,
          lastModified: workout.last_modified,
        }));
        return acc;
      }, {} as Record<string, any>);
      
      localStorage.setItem('workouts', JSON.stringify(processedWorkouts));
      console.log('Workouts saved to localStorage with processed format:', processedWorkouts);
      return true;
    } catch (error) {
      console.error('Error saving workouts to localStorage:', error);
      return false;
    }
  },

  loadWorkouts: (): WeeklyWorkouts | null => {
    try {
      const data = localStorage.getItem('workouts');
      if (!data) {
        console.log('No workouts found in localStorage');
        return null;
      }
      
      const parsedData = JSON.parse(data);
      
      // Convert lastModified back to last_modified for consistency with app
      const processedWorkouts = Object.entries(parsedData).reduce((acc, [day, dayWorkouts]) => {
        acc[day] = (dayWorkouts as any[]).map(workout => ({
          ...workout,
          last_modified: workout.lastModified || workout.last_modified || new Date().toISOString(),
        }));
        return acc;
      }, {} as WeeklyWorkouts);
      
      console.log('Workouts loaded from localStorage with normalized format:', processedWorkouts);
      return processedWorkouts;
    } catch (error) {
      console.error('Error loading workouts from localStorage:', error);
      return null;
    }
  },

  clearWorkouts: () => {
    try {
      localStorage.removeItem('workouts');
      return true;
    } catch (error) {
      console.error('Error clearing workouts from localStorage:', error);
      return false;
    }
  }
};
