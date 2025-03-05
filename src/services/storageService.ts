
import { WeeklyWorkouts } from "@/types/workout";

export const storageService = {
  saveWorkouts: (workouts: WeeklyWorkouts): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        console.log('[StorageService] Saving workouts:', workouts);
        
        // Deep clone and normalize the workouts for consistent format
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
        console.log('[StorageService] Workouts saved successfully:', processedWorkouts);
        resolve(true);
      } catch (error) {
        console.error('[StorageService] Error saving workouts:', error);
        reject(new Error(`Failed to save workouts: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
  },

  loadWorkouts: (): Promise<WeeklyWorkouts | null> => {
    return new Promise((resolve, reject) => {
      try {
        const data = localStorage.getItem('workouts');
        if (!data) {
          console.log('[StorageService] No workouts found in localStorage');
          resolve(null);
          return;
        }
        
        const parsedData = JSON.parse(data);
        console.log('[StorageService] Raw workouts loaded from localStorage:', parsedData);
        
        // Process the data to ensure all workouts have consistent structure
        const processedWorkouts = Object.entries(parsedData).reduce((acc, [day, dayWorkouts]) => {
          if (!Array.isArray(dayWorkouts)) {
            console.warn(`[StorageService] Unexpected format for day ${day}, expected array but got:`, dayWorkouts);
            acc[day] = []; // Default to empty array if invalid data
            return acc;
          }
          
          acc[day] = (dayWorkouts as any[]).map(workout => {
            // Ensure the workout has a valid ID
            if (!workout.id) {
              console.warn('[StorageService] Found workout without ID, generating one');
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
        
        console.log('[StorageService] Processed workouts for application use:', processedWorkouts);
        resolve(processedWorkouts);
      } catch (error) {
        console.error('[StorageService] Error loading workouts from localStorage:', error);
        reject(new Error(`Failed to load workouts: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
  },

  clearWorkouts: (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem('workouts');
        console.log('[StorageService] Workouts cleared successfully');
        resolve(true);
      } catch (error) {
        console.error('[StorageService] Error clearing workouts:', error);
        reject(new Error(`Failed to clear workouts: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
  }
};
