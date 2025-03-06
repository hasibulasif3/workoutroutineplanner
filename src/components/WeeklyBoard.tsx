
import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { WeeklyWorkouts } from "@/types/workout";
import { storageService } from "@/services/storageService";

// Initial workouts state
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
  const [isLoading, setIsLoading] = useState(true);
  const [transactionStatus, setTransactionStatus] = useState<{
    id: string;
    type: string;
    status: 'pending' | 'success' | 'error';
    error?: string | Error;
  } | null>(null);
  
  const workoutsRef = useRef<WeeklyWorkouts>(initialWorkouts);

  useEffect(() => {
    workoutsRef.current = workouts;
  }, [workouts]);

  useEffect(() => {
    const loadWorkouts = async () => {
      const transactionId = uuidv4();
      
      setTransactionStatus({
        id: transactionId,
        type: 'load',
        status: 'pending'
      });
      
      try {
        setIsLoading(true);
        const result = await storageService.loadWorkouts();
        
        if (result.success && result.data) {
          setWorkouts(result.data);
          setTransactionStatus({
            id: transactionId,
            type: 'load',
            status: 'success',
            error: undefined
          });
        } else {
          if (result.error) {
            setTransactionStatus({
              id: transactionId,
              type: 'load',
              status: 'error',
              // Fix: Store the error directly without trying to access message
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

    loadWorkouts();
  }, []);

  const saveWorkoutsToStorage = useCallback(async (workoutsToSave: WeeklyWorkouts) => {
    const transactionId = uuidv4();
    
    setTransactionStatus({
      id: transactionId,
      type: 'save',
      status: 'pending'
    });
    
    try {
      const { success, error } = await storageService.saveWorkouts(workoutsToSave);
      
      if (success) {
        setTransactionStatus({
          id: transactionId,
          type: 'save',
          status: 'success'
        });
        return true;
      } else {
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

  // Export the component as is - this is a legacy file and the actual component is now in weekly-board/WeeklyBoard.tsx
  return null;
}
