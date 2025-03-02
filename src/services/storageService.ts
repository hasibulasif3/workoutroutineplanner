
// This is just a placeholder - I believe this file is in the read-only files, but I'm adding this check
// since it's part of the core flow we're fixing. If it's not editable, we'll have to work with what we have.

import { WeeklyWorkouts } from "@/types/workout";

export const storageService = {
  saveWorkouts: (workouts: WeeklyWorkouts) => {
    try {
      localStorage.setItem('workouts', JSON.stringify(workouts));
      console.log('Workouts saved to localStorage:', workouts);
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
      
      const parsedData = JSON.parse(data) as WeeklyWorkouts;
      console.log('Workouts loaded from localStorage:', parsedData);
      return parsedData;
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
