import { WeeklyWorkouts } from "@/types/workout";

export const initialWorkouts: WeeklyWorkouts = {
  Monday: [
    { 
      id: "1", 
      title: "Morning Run", 
      duration: "30", 
      type: "cardio", 
      difficulty: "beginner", 
      calories: "300",
      last_modified: new Date().toISOString(),
      exercises: []
    },
    { 
      id: "2", 
      title: "Push-ups", 
      duration: "15", 
      type: "strength", 
      difficulty: "intermediate", 
      calories: "150",
      last_modified: new Date().toISOString(),
      exercises: []
    },
  ],
  Tuesday: [
    { 
      id: "3", 
      title: "Yoga", 
      duration: "45", 
      type: "flexibility", 
      difficulty: "beginner", 
      calories: "200",
      last_modified: new Date().toISOString(),
      exercises: []
    },
  ],
  Wednesday: [
    { 
      id: "4", 
      title: "HIIT", 
      duration: "25", 
      type: "cardio", 
      difficulty: "advanced", 
      calories: "400",
      last_modified: new Date().toISOString(),
      exercises: []
    },
  ],
  Thursday: [
    { 
      id: "5", 
      title: "Swimming", 
      duration: "40", 
      type: "cardio", 
      difficulty: "intermediate", 
      calories: "450",
      last_modified: new Date().toISOString(),
      exercises: []
    },
  ],
  Friday: [
    { 
      id: "6", 
      title: "Weight Training", 
      duration: "50", 
      type: "strength", 
      difficulty: "advanced", 
      calories: "500",
      last_modified: new Date().toISOString(),
      exercises: []
    },
  ],
  Saturday: [],
  Sunday: [],
};