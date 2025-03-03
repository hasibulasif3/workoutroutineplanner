
import { WeeklyWorkouts } from "@/types/workout";

export const storageService = {
  saveWorkouts: (workouts: WeeklyWorkouts) => {
    try {
      console.log('Attempting to save workouts to localStorage:', workouts);
      
      // Ensure the workouts have been properly formatted first - deep clone and normalize
      const processedWorkouts = Object.entries(workouts).reduce((acc, [day, dayWorkouts]) => {
        acc[day] = dayWorkouts.map(workout => {
          // Ensure timestamp is consistently applied
          const timestamp = workout.last_modified || new Date().toISOString();
          
          return {
            ...workout,
            // Always set both properties for backwards compatibility
            lastModified: timestamp,
            last_modified: timestamp,
            // Ensure exercises is always an array
            exercises: Array.isArray(workout.exercises) ? workout.exercises : []
          };
        });
        return acc;
      }, {} as Record<string, any>);
      
      localStorage.setItem('workouts', JSON.stringify(processedWorkouts));
      console.log('Workouts saved to localStorage successfully:', processedWorkouts);
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
      console.log('Raw workouts loaded from localStorage:', parsedData);
      
      // Process the data to ensure all workouts have consistent structure
      const processedWorkouts = Object.entries(parsedData).reduce((acc, [day, dayWorkouts]) => {
        if (!Array.isArray(dayWorkouts)) {
          console.warn(`Unexpected format for day ${day}, expected array but got:`, dayWorkouts);
          acc[day] = []; // Default to empty array if invalid data
          return acc;
        }
        
        acc[day] = (dayWorkouts as any[]).map(workout => {
          // Ensure the workout has a valid ID
          if (!workout.id) {
            console.warn('Found workout without ID, generating one');
            workout.id = `recovery-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          }
          
          // Normalize timestamp fields - ensure both fields exist with the same value
          const timestamp = workout.last_modified || workout.lastModified || new Date().toISOString();
          
          return {
            ...workout,
            last_modified: timestamp,
            lastModified: timestamp,
            // Ensure these fields exist
            title: workout.title || "Unknown Workout",
            duration: workout.duration || "0",
            type: workout.type || "strength",
            // Also include an array of exercises if missing
            exercises: Array.isArray(workout.exercises) ? workout.exercises : []
          };
        });
        
        return acc;
      }, {} as WeeklyWorkouts);
      
      console.log('Processed workouts for application use:', processedWorkouts);
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
