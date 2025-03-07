
import { DndContext, DragEndEvent, DragStartEvent, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useEffect, useCallback, useRef } from "react";
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
import { TransactionStatus } from "./types";

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
  const [dropSound] = useState(() => new Audio("/assets/drop-sound.mp3"));
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [transactions, setTransactions] = useState<TransactionStatus[]>([]);
  
  // Ref to track if component is mounted (prevents state updates after unmount)
  const workoutsRef = useRef<WeeklyWorkouts>(initialWorkouts);

  useEffect(() => {
    workoutsRef.current = workouts;
    console.log('[WeeklyBoard] Workouts state updated:', workouts);
  }, [workouts]);

  const addTransaction = useCallback((transaction: Omit<TransactionStatus, 'timestamp'>) => {
    const fullTransaction = {
      ...transaction,
      timestamp: new Date()
    };
    console.log('[WeeklyBoard] New transaction:', fullTransaction);
    setTransactions(prev => [...prev, fullTransaction]);
    return fullTransaction;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<TransactionStatus>) => {
    console.log(`[WeeklyBoard] Updating transaction ${id}:`, updates);
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates, timestamp: new Date() } : t)
    );
  }, []);

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const loadTransactionId = uuidv4();
        addTransaction({
          id: loadTransactionId,
          type: 'load',
          status: 'pending'
        });

        setIsLoading(true);
        const result = await storageService.loadWorkouts();
        
        if (result.success && result.data) {
          console.log("[WeeklyBoard] Loaded workouts from storage:", result.data);
          setWorkouts(result.data);
          updateTransaction(loadTransactionId, { 
            status: 'success', 
            data: { workoutCount: Object.values(result.data).flat().length }
          });
        } else {
          console.log("[WeeklyBoard] No saved workouts found, using initial data");
          if (result.error) {
            updateTransaction(loadTransactionId, { 
              status: 'error', 
              error: result.error
            });
          } else {
            updateTransaction(loadTransactionId, { status: 'success' });
          }
        }
      } catch (error) {
        console.error("[WeeklyBoard] Error loading workouts:", error);
        toast.error("Failed to load your workouts", {
          description: "There was a problem loading your workout data."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkouts();
  }, [addTransaction, updateTransaction]);

  const saveWorkoutsToStorage = useCallback(async (currentWorkouts: WeeklyWorkouts, transactionId?: string) => {
    try {
      console.log("[WeeklyBoard] Saving workouts to storage:", currentWorkouts);
      const { success, error } = await storageService.saveWorkouts(currentWorkouts);
      
      if (success) {
        console.log("[WeeklyBoard] Workouts saved successfully");
        if (transactionId) {
          updateTransaction(transactionId, { status: 'success' });
        }
        return true;
      } else {
        console.error("[WeeklyBoard] Failed to save workouts:", error);
        if (transactionId) {
          updateTransaction(transactionId, { 
            status: 'error', 
            error: error
          });
        }
        return false;
      }
    } catch (error) {
      console.error("[WeeklyBoard] Error saving workouts:", error);
      toast.error("Failed to save workout changes", {
        description: "There was a problem saving your workout data."
      });
      if (transactionId) {
        updateTransaction(transactionId, { 
          status: 'error', 
          error: error
        });
      }
      return false;
    }
  }, [updateTransaction]);

  useEffect(() => {
    if (!isLoading) {
      saveWorkoutsToStorage(workouts);
    }
  }, [workouts, isLoading, saveWorkoutsToStorage]);

  const verifyWorkoutExists = useCallback((id: string): boolean => {
    const currentWorkouts = workoutsRef.current;
    return storageService.verifyWorkoutExists(currentWorkouts, id);
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
    
    const moveTransactionId = uuidv4();
    
    try {
      const activeDay = Object.entries(workouts).find(
        ([day, items]) => items.find(item => item.id === active.id.toString())
      )?.[0];
      
      const overDay = over.id.toString();
      
      if (!activeDay || activeDay === overDay) return;
      
      addTransaction({
        id: moveTransactionId,
        type: 'move',
        status: 'pending',
        data: { from: activeDay, to: overDay, workoutId: active.id.toString() }
      });
      
      setWorkouts(prev => {
        const workout = prev[activeDay].find(item => item.id === active.id.toString());
        if (!workout) {
          updateTransaction(moveTransactionId, { 
            status: 'error', 
            error: `Workout with id ${active.id} not found in ${activeDay}`
          });
          return prev;
        }
        
        const updatedWorkout: Workout = {
          ...workout,
          last_modified: new Date().toISOString()
        };
        
        const newWorkouts = {
          ...prev,
          [activeDay]: prev[activeDay].filter(item => item.id !== active.id.toString()),
          [overDay]: [...prev[overDay], updatedWorkout]
        };
        
        saveWorkoutsToStorage(newWorkouts, moveTransactionId)
          .then(success => {
            if (success) {
              dropSound.play().catch(err => console.error("Error playing sound:", err));
              
              toast.success(`Workout moved to ${overDay}`, {
                description: `"${workout.title}" has been moved successfully.`
              });
            }
          });
        
        return newWorkouts;
      });
    } catch (error) {
      console.error("[WeeklyBoard] Error in handleDragEnd:", error);
      updateTransaction(moveTransactionId, { 
        status: 'error', 
        error: error
      });
      
      toast.error("Failed to move workout", {
        description: "There was a problem updating your workout position."
      });
    }
  };

  const handleWorkoutCreate = async (workoutData: WorkoutInput): Promise<void> => {
    console.log("[WeeklyBoard] handleWorkoutCreate called with data:", workoutData);
    
    const createTransactionId = uuidv4();
    
    try {
      setIsCreatingWorkout(true);
      
      addTransaction({
        id: createTransactionId,
        type: 'create',
        status: 'pending',
        data: { workoutData }
      });
      
      if (!workoutData.title?.trim() || !workoutData.type || !workoutData.duration) {
        const missingFields = [
          !workoutData.title?.trim() ? "title" : "",
          !workoutData.type ? "type" : "",
          !workoutData.duration ? "duration" : ""
        ].filter(Boolean).join(", ");
        
        console.error(`[WeeklyBoard] Missing required workout fields: ${missingFields}`);
        
        updateTransaction(createTransactionId, {
          status: 'error',
          error: `Missing required fields: ${missingFields}`
        });
        
        toast.error("Invalid workout data", {
          description: "Please ensure all required fields are filled out."
        });
        
        setIsCreatingWorkout(false);
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
        exercises: workoutData.exercises || []
      };

      console.log("[WeeklyBoard] Created new workout object:", newWorkout);
      
      // CRITICAL FIX: Update state with the new workout and make sure we're replacing the entire state
      setWorkouts(prevWorkouts => {
        const updatedWorkouts = {
          ...prevWorkouts,
          Monday: [...prevWorkouts.Monday, newWorkout]
        };
        
        // Schedule storage save after state update
        saveWorkoutsToStorage(updatedWorkouts, createTransactionId)
          .then(success => {
            if (success) {
              // Fix for notification issue - ensure the toast is shown on successful creation
              toast({
                title: "Workout Added",
                description: `"${newWorkout.title}" has been added to Monday.`,
                duration: 3000
              });
              
              // Trigger haptic feedback if available
              if (window.navigator.vibrate) {
                window.navigator.vibrate(100);
              }
            }
          });
        
        return updatedWorkouts;
      });
      
      updateTransaction(createTransactionId, {
        status: 'success',
        data: { workout: newWorkout }
      });
      
      setIsCreatingWorkout(false);
      return Promise.resolve();
    } catch (error) {
      console.error("[WeeklyBoard] Error in handleWorkoutCreate:", error);
      updateTransaction(createTransactionId, {
        status: 'error',
        error: error
      });
      setIsCreatingWorkout(false);
      toast.error("Failed to create workout", {
        description: "An unexpected error occurred. Please try again."
      });
      
      return Promise.reject(error);
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
        </DragProvider>
      </ErrorBoundary>
    </Layout>
  );
}
