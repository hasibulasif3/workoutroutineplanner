
import { DndContext, DragEndEvent, DragStartEvent, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useEffect, useCallback, useRef } from "react";
import { DayColumn } from "./DayColumn";
import { WorkoutCard } from "./WorkoutCard";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { WeeklyWorkouts, Workout, WorkoutInput } from "@/types/workout";
import { storageService } from "@/services/storageService";
import { StatsBar } from "./StatsBar";
import { ActionBar } from "./ActionBar";
import { ErrorBoundary } from "./ErrorBoundary";
import { Layout } from "./layout/Layout";

const initialWorkouts: WeeklyWorkouts = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: []
};

export function WeeklyBoard() {
  const [workouts, setWorkouts] = useState<WeeklyWorkouts>(initialWorkouts);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropSound] = useState(() => new Audio("/src/assets/drop-sound.mp3"));
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<{
    id: string;
    type: string;
    status: 'pending' | 'success' | 'error';
    error?: string | Error;
  } | null>(null);
  
  const workoutsRef = useRef<WeeklyWorkouts>(initialWorkouts);

  useEffect(() => {
    workoutsRef.current = workouts;
    console.log('[WeeklyBoard] Workouts state updated:', workouts);
  }, [workouts]);

  useEffect(() => {
    const loadSavedWorkouts = async () => {
      const transactionId = uuidv4();
      setTransactionStatus({
        id: transactionId,
        type: 'load',
        status: 'pending'
      });
      
      setIsLoading(true);
      try {
        const result = await storageService.loadWorkouts();
        if (result.success && result.data) {
          console.log("[WeeklyBoard] Loaded workouts from storage:", result.data);
          setWorkouts(result.data);
          setTransactionStatus({
            id: transactionId,
            type: 'load',
            status: 'success'
          });
        } else {
          console.log("[WeeklyBoard] No saved workouts found, using initial data");
          if (result.error) {
            console.error("[WeeklyBoard] Error loading workouts:", result.error);
            setTransactionStatus({
              id: transactionId,
              type: 'load',
              status: 'error',
              // Fix: Check if error is an Error object or a string
              error: result.error
            });
          } else {
            setTransactionStatus({
              id: transactionId,
              type: 'load',
              status: 'success'
            });
          }
        }
      } catch (error) {
        console.error("[WeeklyBoard] Error loading workouts:", error);
        setTransactionStatus({
          id: transactionId,
          type: 'load',
          status: 'error',
          // Fix: Store the error directly without trying to access message
          error: error instanceof Error ? error : String(error)
        });
        
        toast.error("Failed to load your workouts", {
          description: "There was a problem loading your workout data."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedWorkouts();
  }, []);

  const saveWorkoutsToStorage = useCallback(async (currentWorkouts: WeeklyWorkouts): Promise<boolean> => {
    const transactionId = uuidv4();
    setTransactionStatus({
      id: transactionId,
      type: 'save',
      status: 'pending'
    });
    
    try {
      console.log("[WeeklyBoard] Saving workouts to storage:", currentWorkouts);
      const { success, error } = await storageService.saveWorkouts(currentWorkouts);
      
      if (success) {
        console.log("[WeeklyBoard] Workouts saved successfully");
        setTransactionStatus({
          id: transactionId,
          type: 'save',
          status: 'success'
        });
        return true;
      } else {
        console.error("[WeeklyBoard] Failed to save workouts:", error);
        setTransactionStatus({
          id: transactionId,
          type: 'save',
          status: 'error',
          // Fix: Store the error directly
          error: error
        });
        return false;
      }
    } catch (error) {
      console.error("[WeeklyBoard] Error saving workouts:", error);
      setTransactionStatus({
        id: transactionId,
        type: 'save',
        status: 'error',
        // Fix: Store the error directly
        error: error instanceof Error ? error : String(error)
      });
      
      toast.error("Failed to save workout changes", {
        description: "There was a problem saving your workout data."
      });
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isLoading && workouts !== initialWorkouts) {
      saveWorkoutsToStorage(workouts);
    }
  }, [workouts, isLoading, saveWorkoutsToStorage]);

  const verifyWorkoutExists = useCallback((id: string): boolean => {
    const currentWorkouts = workoutsRef.current;
    for (const day in currentWorkouts) {
      if (currentWorkouts[day].some(workout => workout.id === id)) {
        return true;
      }
    }
    return false;
  }, []);

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
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Find which day contains the active workout
    let activeDay: string | null = null;
    for (const [day, dayWorkouts] of Object.entries(workouts)) {
      if (dayWorkouts.some(workout => workout.id === activeId)) {
        activeDay = day;
        break;
      }
    }
    
    if (!activeDay || activeDay === overId) return;
    
    setWorkouts(prev => {
      // Find the workout in the source day
      const workout = prev[activeDay!].find(item => item.id === activeId);
      if (!workout) return prev;
      
      // Create updated workout with new timestamp
      const updatedWorkout: Workout = {
        ...workout,
        last_modified: new Date().toISOString()
      };
      
      // Create new workouts state with the workout moved to target day
      const newWorkouts = {
        ...prev,
        [activeDay!]: prev[activeDay!].filter(item => item.id !== activeId),
        [overId]: [...prev[overId], updatedWorkout]
      };
      
      // Play sound effect and show toast notification
      dropSound.play().catch(err => console.error("Error playing sound:", err));
      toast.success(`Workout moved to ${overId}`, {
        description: `"${workout.title}" has been moved successfully.`
      });
      
      return newWorkouts;
    });
  };

  const handleWorkoutCreate = async (workoutData: WorkoutInput): Promise<void> => {
    console.log("[WeeklyBoard] handleWorkoutCreate called with data:", workoutData);
    
    try {
      setIsCreatingWorkout(true);
      
      if (!workoutData.title?.trim() || !workoutData.type || !workoutData.duration) {
        const missingFields = [
          !workoutData.title?.trim() ? "title" : "",
          !workoutData.type ? "type" : "",
          !workoutData.duration ? "duration" : ""
        ].filter(Boolean).join(", ");
        
        console.error(`[WeeklyBoard] Missing required workout fields: ${missingFields}`);
        toast.error("Invalid workout data", {
          description: "Please ensure all required fields are filled out."
        });
        
        throw new Error(`Missing required fields: ${missingFields}`);
      }
      
      const timestamp = new Date().toISOString();
      const newWorkout: Workout = {
        id: uuidv4(),
        last_modified: timestamp,
        title: workoutData.title.trim(),
        type: workoutData.type,
        duration: workoutData.duration,
        difficulty: workoutData.difficulty || "beginner",
        calories: workoutData.calories || "0",
        notes: workoutData.notes || "",
        exercises: Array.isArray(workoutData.exercises) ? [...workoutData.exercises] : []
      };

      console.log("[WeeklyBoard] Created new workout object:", newWorkout);
      
      return new Promise<void>((resolve, reject) => {
        setWorkouts(prevWorkouts => {
          const updatedWorkouts = {
            ...prevWorkouts,
            Monday: [...prevWorkouts.Monday, newWorkout]
          };
          
          // Save workouts to storage after state update
          saveWorkoutsToStorage(updatedWorkouts)
            .then(successful => {
              if (successful) {
                console.log("[WeeklyBoard] Workout saved to storage successfully");
                toast.success("Workout added to Monday", {
                  description: `"${newWorkout.title}" has been added to your schedule.`
                });
                resolve();
              } else {
                const errorMsg = "Failed to save workout to storage";
                console.error(`[WeeklyBoard] ${errorMsg}`);
                toast.error("Failed to add workout", {
                  description: "There was a problem saving your workout. Please try again."
                });
                reject(new Error(errorMsg));
              }
            })
            .finally(() => {
              setIsCreatingWorkout(false);
            });
          
          return updatedWorkouts;
        });
      });
    } catch (error) {
      console.error("[WeeklyBoard] Error in handleWorkoutCreate:", error);
      setIsCreatingWorkout(false);
      throw error;
    }
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
            <ActionBar 
              workouts={workouts} 
              onWorkoutCreate={handleWorkoutCreate}
              isCreatingWorkout={isCreatingWorkout}
            />
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
      </ErrorBoundary>
    </Layout>
  );
}
