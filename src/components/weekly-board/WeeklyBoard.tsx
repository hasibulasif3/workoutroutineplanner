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
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [transactions, setTransactions] = useState<TransactionStatus[]>([]);
  
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
        const { success, data: savedWorkouts, error } = await storageService.loadWorkouts();
        
        if (success && savedWorkouts) {
          console.log("[WeeklyBoard] Loaded workouts from storage:", savedWorkouts);
          setWorkouts(savedWorkouts);
          updateTransaction(loadTransactionId, { 
            status: 'success', 
            data: { workoutCount: Object.values(savedWorkouts).flat().length }
          });
        } else {
          console.log("[WeeklyBoard] No saved workouts found, using initial data");
          if (error) {
            updateTransaction(loadTransactionId, { 
              status: 'error', 
              error
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
            error: error || 'Unknown error saving workouts'
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
          error: error instanceof Error ? error : String(error)
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
        error: error instanceof Error ? error : String(error)
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
        try {
          setWorkouts(prevWorkouts => {
            console.log("[WeeklyBoard] Updating workouts state with new workout");
            const updatedWorkouts = {
              ...prevWorkouts,
              Monday: [...prevWorkouts.Monday, newWorkout]
            };
            
            saveWorkoutsToStorage(updatedWorkouts, createTransactionId)
              .then(successful => {
                if (successful) {
                  console.log("[WeeklyBoard] Workout saved to storage successfully");
                  
                  const exists = verifyWorkoutExists(newWorkout.id);
                  if (exists) {
                    toast.success("Workout added to Monday", {
                      description: `"${newWorkout.title}" has been added to your schedule.`
                    });
                    resolve();
                  } else {
                    const errorMsg = "Workout failed to appear in state after creation";
                    console.error(`[WeeklyBoard] ${errorMsg}`);
                    updateTransaction(createTransactionId, {
                      status: 'error',
                      error: errorMsg
                    });
                    
                    toast.error("Failed to add workout", {
                      description: "There was a problem adding your workout. Please try again."
                    });
                    reject(new Error(errorMsg));
                  }
                } else {
                  console.error("[WeeklyBoard] Failed to save workout to storage");
                  updateTransaction(createTransactionId, {
                    status: 'error',
                    error: "Failed to save workout to storage"
                  });
                  reject(new Error("Failed to save workout to storage"));
                }
              })
              .finally(() => {
                setIsCreatingWorkout(false);
              });
              
            return updatedWorkouts;
          });
        } catch (error) {
          console.error("[WeeklyBoard] Error in workout creation transaction:", error);
          updateTransaction(createTransactionId, {
            status: 'error',
            error: error instanceof Error ? error : String(error)
          });
          setIsCreatingWorkout(false);
          reject(error);
        }
      });
    } catch (error) {
      console.error("[WeeklyBoard] Error in handleWorkoutCreate:", error);
      updateTransaction(createTransactionId, {
        status: 'error',
        error: error instanceof Error ? error : String(error)
      });
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
