
import { DndContext, DragEndEvent, DragStartEvent, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useEffect, useCallback } from "react";
import { DayColumn } from "../DayColumn";
import { WorkoutCard } from "../WorkoutCard";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { WeeklyWorkouts, Workout, WorkoutInput } from "@/types/workout";
import { storageService } from "@/services/storageService";
import { StatsBar } from "../StatsBar";
import { ActionBar } from "../ActionBar";
import { ErrorBoundary } from "../ErrorBoundary";
import { DragProvider } from "./DragContext";
import { Layout } from "../layout/Layout";

const initialWorkouts: WeeklyWorkouts = {
  Monday: [{
    id: "1",
    title: "Push-ups",
    duration: "15",
    type: "strength",
    difficulty: "intermediate",
    calories: "150",
    last_modified: new Date().toISOString(),
    exercises: []
  }, {
    id: "2",
    title: "HIIT",
    duration: "25",
    type: "cardio",
    difficulty: "advanced",
    calories: "400",
    last_modified: new Date().toISOString(),
    exercises: []
  }],
  Tuesday: [{
    id: "3",
    title: "Yoga",
    duration: "45",
    type: "flexibility",
    difficulty: "beginner",
    calories: "200",
    last_modified: new Date().toISOString(),
    exercises: []
  }],
  Wednesday: [],
  // Rest Day
  Thursday: [{
    id: "4",
    title: "Swimming",
    duration: "40",
    type: "cardio",
    difficulty: "advanced",
    calories: "450",
    last_modified: new Date().toISOString(),
    exercises: []
  }],
  Friday: [{
    id: "5",
    title: "Weight Training",
    duration: "50",
    type: "strength",
    difficulty: "advanced",
    calories: "500",
    last_modified: new Date().toISOString(),
    exercises: []
  }],
  Saturday: [{
    id: "6",
    title: "Morning Run",
    duration: "30",
    type: "cardio",
    difficulty: "beginner",
    calories: "300",
    last_modified: new Date().toISOString(),
    exercises: []
  }],
  Sunday: [{
    id: "7",
    title: "Dynamic Stretching",
    duration: "25",
    type: "flexibility",
    difficulty: "beginner",
    calories: "150",
    last_modified: new Date().toISOString(),
    exercises: []
  }]
};

export function WeeklyBoard() {
  const [workouts, setWorkouts] = useState<WeeklyWorkouts>(initialWorkouts);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropSound] = useState(() => new Audio("/src/assets/drop-sound.mp3"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorkouts = () => {
      try {
        const savedWorkouts = storageService.loadWorkouts();
        if (savedWorkouts) {
          console.log("Loaded workouts from storage:", savedWorkouts);
          setWorkouts(savedWorkouts);
        } else {
          console.log("No saved workouts found, using initial data");
        }
      } catch (error) {
        console.error("Error loading workouts:", error);
        toast.error("Failed to load your workouts");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkouts();
  }, []);

  // Save workouts to storage whenever they change
  const saveWorkoutsToStorage = useCallback((currentWorkouts: WeeklyWorkouts) => {
    try {
      const saveResult = storageService.saveWorkouts(currentWorkouts);
      if (saveResult) {
        console.log("Workouts saved successfully:", currentWorkouts);
      } else {
        console.error("Failed to save workouts");
      }
    } catch (error) {
      console.error("Error saving workouts:", error);
      toast.error("Failed to save workout changes");
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveWorkoutsToStorage(workouts);
    }
  }, [workouts, isLoading, saveWorkoutsToStorage]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    
    if (!over) return;
    
    const activeDay = Object.entries(workouts).find(
      ([day, items]) => items.find(item => item.id === active.id.toString())
    )?.[0];
    
    const overDay = over.id.toString();
    
    if (!activeDay || activeDay === overDay) return;
    
    setWorkouts(prev => {
      const workout = prev[activeDay].find(item => item.id === active.id.toString());
      if (!workout) return prev;
      
      const updatedWorkout: Workout = {
        ...workout,
        last_modified: new Date().toISOString()
      };
      
      const newWorkouts = {
        ...prev,
        [activeDay]: prev[activeDay].filter(item => item.id !== active.id.toString()),
        [overDay]: [...prev[overDay], updatedWorkout]
      };
      
      dropSound.play().catch(err => console.error("Error playing sound:", err));
      toast.success(`Workout moved to ${overDay}`, {
        description: `"${workout.title}" has been moved successfully.`
      });
      
      return newWorkouts;
    });
  };

  const handleWorkoutCreate = async (workoutData: WorkoutInput): Promise<void> => {
    console.log("handleWorkoutCreate called with data:", workoutData);
    
    return new Promise<void>((resolve, reject) => {
      try {
        if (!workoutData.title || !workoutData.type || !workoutData.duration) {
          const missingFields = [
            !workoutData.title ? "title" : "",
            !workoutData.type ? "type" : "",
            !workoutData.duration ? "duration" : ""
          ].filter(Boolean).join(", ");
          
          console.error(`Missing required workout fields: ${missingFields}`);
          toast.error("Invalid workout data", {
            description: "Please ensure all required fields are filled out."
          });
          return reject(new Error(`Missing required fields: ${missingFields}`));
        }
        
        const newWorkout: Workout = {
          id: uuidv4(),
          last_modified: new Date().toISOString(),
          title: workoutData.title,
          type: workoutData.type,
          duration: workoutData.duration,
          difficulty: workoutData.difficulty || "beginner",
          calories: workoutData.calories || "0",
          notes: workoutData.notes || "",
          exercises: Array.isArray(workoutData.exercises) ? [...workoutData.exercises] : []
        };

        console.log("Created new workout object:", newWorkout);
        
        // Update the state with the new workout using a callback function
        setWorkouts(prevWorkouts => {
          // Create a new workouts object to avoid mutation
          const updatedWorkouts = {
            ...prevWorkouts,
            Monday: [...prevWorkouts.Monday, newWorkout]
          };
          
          console.log("New workouts state after update:", updatedWorkouts);
          
          // Save immediately to ensure data persistence
          setTimeout(() => {
            saveWorkoutsToStorage(updatedWorkouts);
          }, 0);
          
          return updatedWorkouts;
        });

        // Show success notification after state update
        toast.success("Workout added to Monday", {
          description: `"${newWorkout.title}" has been added to your schedule.`,
          duration: 4000,
        });

        console.log("Workout created successfully");
        resolve();
      } catch (error) {
        console.error("Error in handleWorkoutCreate:", error);
        toast.error("Failed to create workout", {
          description: "There was a problem adding your workout. Please try again.",
        });
        reject(error);
      }
    });
  };

  const activeWorkout = activeId ? Object.values(workouts).flat().find(w => w.id === activeId) : null;

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>;
  }

  return (
    <Layout>
      <ErrorBoundary>
        <DragProvider>
          <div className="p-8 animate-fade-in">
            <div className="flex flex-col items-center mb-12">
              <motion.h1 className="text-5xl font-bold title-gradient mb-4" initial={{
              opacity: 0,
              y: -20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5
            }}>
                Workout Routine Planner
              </motion.h1>
              
              <motion.p className="text-lg text-gray-400 mb-8" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              delay: 0.2,
              duration: 0.5
            }}>
                Plan your workouts, track your progress, achieve your goals
              </motion.p>
              
              <StatsBar workouts={workouts} />
              <ActionBar workouts={workouts} onWorkoutCreate={handleWorkoutCreate} />
            </div>

            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {Object.entries(workouts).map(([day, dayWorkouts]) => (
                  <SortableContext key={day} items={dayWorkouts.map(w => w.id)} strategy={verticalListSortingStrategy}>
                    <DayColumn day={day} workouts={dayWorkouts} />
                  </SortableContext>
                ))}
              </div>
              <DragOverlay>
                {activeId && activeWorkout ? <div className="opacity-80 rotate-3 scale-105">
                    <WorkoutCard {...activeWorkout} />
                  </div> : null}
              </DragOverlay>
            </DndContext>
          </div>
        </DragProvider>
      </ErrorBoundary>
    </Layout>
  );
}
