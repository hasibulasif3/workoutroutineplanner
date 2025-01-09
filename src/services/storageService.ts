import { WeeklyWorkouts } from "@/types/workout";

const STORAGE_KEY = 'workout-planner-data';

export const storageService = {
  saveWorkouts: (workouts: WeeklyWorkouts) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    } catch (error) {
      console.error('Error saving workouts:', error);
    }
  },

  loadWorkouts: (): WeeklyWorkouts | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading workouts:', error);
      return null;
    }
  }
};